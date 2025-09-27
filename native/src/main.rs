use serde;
use std::{fs, io::ErrorKind, path};

#[derive(serde::Deserialize)]
#[serde(rename_all = "snake_case")]
enum AlreadyExists {
    Replace,
    Throw,
    DeleteAndThrow,
}

#[derive(serde::Deserialize)]
#[serde(default)]
struct RequestOptions {
    create_dest_folder: bool,
    already_exists: AlreadyExists
}

#[derive(serde::Deserialize)]
struct Request {
    file: path::PathBuf,
    dest: path::PathBuf,
    #[serde(flatten)]
    options: RequestOptions
}

impl Default for RequestOptions {
    fn default() -> Self {
        Self {
            create_dest_folder: false,
            already_exists: AlreadyExists::Throw
        }
    }
}

#[derive(serde::Serialize)]
#[serde(rename_all = "snake_case")]
enum ErrorType {
    FileNoExists,
    DestDirNoExists,
    FailedToRemoveFile,
    DestExists,
    Other
}

#[derive(serde::Serialize)]
#[serde(tag = "type")]
#[serde(rename_all = "snake_case")]
enum Return {
    #[serde(rename = "success")]
    Success,
    #[serde(rename = "error")]
    Error {error_type: ErrorType, message: String}
}

fn report_error(error_type: ErrorType, err: &String) {
    let result = Return::Error {
        error_type: error_type,
        message: err.to_string()
    };

    serde_json::to_writer(std::io::stdout(), &result).unwrap();
}

fn main() {
    let request: Request = match serde_json::from_reader(std::io::stdin()) {
        Ok(req) => req,
        Err(e) => {
            report_error(ErrorType::Other, &e.to_string());
            return;
        }
    };
    if !request.file.exists() {
        report_error(ErrorType::FileNoExists, &format!("File {} does not exist", request.file.display()));
        return;
    }

    if !request.dest.parent().unwrap().exists() {
        if request.options.create_dest_folder {
            // TODO
            report_error(ErrorType::Other, &"create_dest_folder is not yet supported".into());
        }
        else {
            report_error(ErrorType::DestDirNoExists, &format!("Destination directory {} does not exist", request.dest.parent().unwrap().display()));
            return;
        }
    }

    if request.dest.exists() {
        match request.options.already_exists {
            AlreadyExists::Replace => {
                report_error(ErrorType::Other, &"replace is not yet supported".into());
            },
            AlreadyExists::Throw => {
                report_error(ErrorType::DestExists, &format!("Destination {} already exists", request.dest.display()));
                return;
            }
            AlreadyExists::DeleteAndThrow => {
                match fs::remove_file(&request.file) {
                    Ok(_) => {
                        report_error(ErrorType::DestExists, &format!("Destination {} already exists", request.dest.display()));
                    }
                    Err(err) => {
                        report_error(ErrorType::FailedToRemoveFile, &err.to_string());
                    }
                }
                return;
            }
        }
    }

    match fs::rename(&request.file, &request.dest) {
        Ok(_) => {},
        Err(err) if err.kind() == ErrorKind::CrossesDevices => {
            // Copy-delete the file instead
            match fs::copy(&request.file, &request.dest) {
                Ok(_) => {},
                Err(err) => {
                    report_error(ErrorType::Other, &err.to_string());
                    return;
                }
            }
            match fs::remove_file(&request.file) {
                Ok(_) => {},
                Err(err) => {
                    report_error(ErrorType::Other, &err.to_string());
                    return;
                }
            }
        },
        Err(err) => {
            report_error(ErrorType::Other, &format!("Error: {}", err.to_string()));
            return;
        }
    }
    serde_json::to_writer(std::io::stdout(), &Return::Success).unwrap();
}
