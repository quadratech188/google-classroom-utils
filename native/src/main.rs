use serde;
use std::{env, fs, io::{self, stdout, ErrorKind, Read, Write}, path};

mod install;

#[derive(serde::Deserialize)]
#[serde(default)]
struct RequestOptions {
    create_dest_folder: bool,
    replace_dest: bool,
    delete_on_error: bool
}

impl Default for RequestOptions {
    fn default() -> Self {
        Self {
            create_dest_folder: false,
            replace_dest: false,
            delete_on_error: false
        }
    }
}

#[derive(serde::Deserialize)]
struct Request {
    file: path::PathBuf,
    dest: path::PathBuf,
    options: RequestOptions
}

#[derive(serde::Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
enum Response {
    Success,
    Error(Error)
}

impl From<Result<(), Error>> for Response {
    fn from(value: Result<(), Error>) -> Self {
        match value {
            Ok(_) => Self::Success,
            Err(err) => Self::Error(err)
        }
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "snake_case")]
enum ErrorType {
    DestDirNoExists,
    DestExists,
    Other
}

#[derive(serde::Serialize)]
struct Error {
    error_type: ErrorType,
    message: String
}

impl From<std::io::Error> for Error {
    fn from(value: std::io::Error) -> Self {
        return Self {
            error_type: ErrorType::Other,
            message: value.to_string()
        }
    }
}

fn read_message() -> Result<String, Error> {
    let mut len_buf = [0u8; 4];
    io::stdin().read_exact(&mut len_buf)?;
    let len = u32::from_ne_bytes(len_buf) as usize;
    let mut buf = vec![0u8; len];
    io::stdin().read_exact(&mut buf)?;

    String::from_utf8(buf).map_err(|err| {
        Error {
            error_type: ErrorType::Other,
            message: err.to_string()
        }
    })
}

fn write_message(msg: &String) -> io::Result<()> {
    let len = msg.len() as u32;
    stdout().write_all(&len.to_ne_bytes())?;
    stdout().write_all(&msg.as_bytes())?;
    stdout().flush()?;

    Ok(())
}

fn parse_message(msg: &String) -> Result<Request, Error> {
    serde_json::from_str(msg).map_err(|err| {
        Error {
            error_type: ErrorType::Other,
            message: err.to_string()
        }
    })
}

fn move_file(request: &Request) -> Result<(), Error> {
    if request.dest.exists() {
        return if request.options.replace_dest {
            Err(Error {
                error_type: ErrorType::Other,
                message: "'replace_dest' is not yet supported".into()
            })
        }
        else {
            Err(Error {
                error_type: ErrorType::DestExists,
                message: format!("Destination path {} already exists", request.dest.display())
            })
        };
    }

    match fs::rename(&request.file, &request.dest) {
        Ok(_) => Ok(()),
        Err(err) => {
            match err.kind() {
                ErrorKind::NotFound => {
                    return Err(Error {
                        error_type: ErrorType::DestDirNoExists,
                        message: format!("Destination folder does not exist")
                    })
                },
                ErrorKind::CrossesDevices => {
                    fs::copy(&request.file, &request.dest)?;
                    fs::remove_file(&request.file)?;
                    Ok(())
                },
                _ => Err(err.into())
            }
        }
    }
}

fn main() -> io::Result<()> {
    let args: Vec<String> = env::args().collect();
    // Native Messaging passes the extension id as argv[1], so we can't just check for argv[1]
    if args.len() > 2 && args[1] == "install" {
        install::install(&args[1]);
        return Ok(())
    };

    let result = read_message()
        .and_then(|msg| parse_message(&msg))
        .and_then(|req| {
            match move_file(&req) {
                Ok(_) => Ok(()),
                Err(err) => {
                    if req.options.delete_on_error {
                        // TODO: Merge both errors
                        fs::remove_file(req.file)?;
                    }
                    Err(err)
                },
            }
        });

    let response: Response = result.into();

    write_message(&serde_json::to_string(&response).expect("Failed to serialize result"))
}
