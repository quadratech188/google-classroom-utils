use std::{env::{current_exe, home_dir}, fs, path::PathBuf};

pub fn generate_native_manifest() -> String {
    format!(include_str!("../native_manifest.json.template"),
    serde_json::to_string(&current_exe().unwrap()).unwrap())
}

pub fn install(name: &String) {
    match if name == "firefox" {
        install_firefox()
    } else {
        Err(format!("Unknown browser: {}", name))
    } {
        Ok(_) => {},
        Err(err) => {
            println!("An error occured: {}", err.to_string());
        }
    }
}

#[cfg(target_os = "linux")]
fn install_firefox() -> Result<(), String> {
    let manifest_path = home_dir().expect("Failed to find HOME dir")
        .join(".mozilla/native-messaging-hosts/gcu_file_mover.json");

    if manifest_path.exists() {
        Err(format!("Manifest file {} already exists.", manifest_path.display()))
    }
    else {
        println!("Writing manifest to {}...", manifest_path.display());
        fs::write(&manifest_path, generate_native_manifest()).map_err(|err| {
            err.to_string()
        }).and_then(|()| {
            println!("Wrote manifest to {}. Please restart Firefox.", manifest_path.display());
            Ok(())
        })
    }
}

#[cfg(target_os = "linux")]
fn install_chromium(exact_name: &String) -> std::io::Result<()> {
    // TODO
    Ok(())
}
