use std::{env::{current_exe, home_dir}, fs};

pub fn install(name: &String) {
    match if name == "firefox" {
        install_firefox()
    } else if name.starts_with("chromium") {
        install_chromium(&name.split(':').last().expect("Failed to parse browser string"))
    } else {
        Err(format!("Unknown browser: {}", name))
    } {
        Ok(_) => {},
        Err(err) => {
            println!("An error occured: {}", err.to_string());
        }
    }
}

fn firefox_manifest() -> String{
    format!(include_str!("../firefox.json.template"), current_exe().unwrap().display())
}

fn chromium_manifest() -> String{
    format!(include_str!("../chromium.json.template"), current_exe().unwrap().display())
}

#[cfg(target_os = "linux")]
fn install_firefox() -> Result<(), String> {
    let manifest_path = home_dir().expect("Failed to find HOME dir")
        .join(".mozilla/native-messaging-hosts/gcu_file_mover.json");

    if manifest_path.exists() {
        println!("Manifest file {} already exists. Overwriting...", manifest_path.display());
    }

    println!("Writing manifest to {}...", manifest_path.display());
    fs::write(&manifest_path, firefox_manifest())
        .map_err(|err| {
            err.to_string()})
        .and_then(|()| {
            println!("Wrote manifest to {}. Please restart Firefox.", manifest_path.display());
            Ok(())
        })
}

#[cfg(target_os = "linux")]
fn install_chromium(exact_name: &str) -> Result<(), String> {

    let manifest_path = home_dir().expect("Failed to find HOME dir")
        .join(format!(".config/{}/NativeMessagingHosts/gcu_file_mover.json", exact_name));

    if manifest_path.exists() {
        println!("Manifest file {} already exists. Overwriting...", manifest_path.display());
    }

    println!("Writing manifest to {}...", manifest_path.display());
    fs::write(&manifest_path, 
        chromium_manifest())
        .map_err(|err| {
            err.to_string()})
        .and_then(|()| {
            println!("Wrote manifest to {}. Please restart {}.", manifest_path.display(), exact_name);
            Ok(())
        })
}

#[cfg(target_os="windows")]
fn install_firefox() -> Result<(), String> {
    println!("Auto install for Windows is unsupported! Follow the install instructions at https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#windows_setup");
    println!("Use the following manifest:\n{}", firefox_manifest());
    Ok(())
}

#[cfg(target_os="windows")]
fn install_chromium(exact_name: &str) -> Result<(), String> {
    println!("Auto install for Windows is unsupported! Follow the install instructions at https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging#native-messaging-host-location");
    println!("Use the following manifest:\n{}", chromium_manifest());
    Ok(())
}
