# Solana Deployment & Faucet Guide

To deploy the **ComplianceVault** smart contract, you first need to have the Solana and Anchor CLI tools installed on your Windows machine.

## 0. Prerequisites (Critical for Windows)

### Install C++ Build Tools
Anchor requires a C++ compiler to be installed. Download the **Visual Studio Build Tools 2022** from [visualstudio.microsoft.com/downloads/](https://visualstudio.microsoft.com/downloads/) (scroll down to "All Downloads" -> "Tools for Visual Studio").

1.  Run the installer.
2.  Select **"Desktop development with C++"**.
3.  Ensure "MSVC v143 - VS 2022 C++ x64/x86 build tools" is checked in the optional components.
4.  Click **Install**.

*Note: This is a large download (~1.5GB) but is required for Rust/Anchor.*

## 1. Tool Installation (WSL / Linux) - RECOMMENDED

Since you are using **WSL**, these commands are much faster and more reliable than the Windows native version.

### Install Solana CLI (WSL)
Run this in your **WSL** window:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.1/install)"
```
*Note: After it finishes, run `source ~/.profile` or restart your terminal.*

#### Troubleshooting: 'SSL_ERROR_SYSCALL' in WSL
If you get a connection error, try these fixes in order:

**Fix 1: Adjust MTU (Common WSL Network Fix)**
Run this in your WSL terminal:
```bash
sudo ip link set dev eth0 mtu 1350
```
Then try the install command again.

### 1.5. NETWORK BLOCKED? Use GitHub Mirror (Manual WSL)

If `release.solana.com` or the manual installer above fails with "Connection Closed", follow these steps to download directly from GitHub:

1.  **On Windows**: Go to the [Official Solana Releases on GitHub](https://github.com/solana-labs/solana/releases/latest).
2.  Scroll down to **Assets** and download:
    *   **For WSL/Linux**: `solana-release-x86_64-unknown-linux-gnu.tar.bz2`
3.  **In WSL**, run these commands to install:
    ```bash
    # Move to your Windows Downloads folder
    cd /mnt/c/Users/RICHEY_SON/Downloads

    # Extract the downloaded archive
    tar jxf solana-release-x86_64-unknown-linux-gnu.tar.bz2

    # Move it to your local home directory for stability
    mv solana-release ~/

    # Add it to your PATH
    echo 'export PATH="$HOME/solana-release/bin:$PATH"' >> ~/.profile
    source ~/.profile

    # Verify
    solana --version
    ```

---

## 2. Tool Installation (Windows Native)

### Install Rust (If missing)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install Anchor CLI (WSL)
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

## 2. Tool Installation (Windows Native)

### Install Solana CLI

Due to possible SSL/TLS issues with the automated command, try these options in order:

#### Option A: Manual Browser Download (Easiest)
1.  Open this link in your browser: [https://release.solana.com/v1.18.1/solana-install-init.exe](https://release.solana.com/v1.18.1/solana-install-init.exe)
2.  Save the file to your computer (e.g., in your Downloads folder).
3.  Open PowerShell and navigate to where you saved it (e.g., `cd ~\Downloads`).
4.  Run the installer:
    ```powershell
    .\solana-install-init.exe v1.18.1
    ```

#### Option B: Windows Package Manager (Winget)
If you have `winget` installed (standard on modern Windows 10/11), run:
```powershell
winget install Solana.CLI
```

#### Option C: Automated Command (Alternative Fix)
```powershell
# Try enforcing TLS 1.3/1.2 together
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13
Invoke-WebRequest -Uri "https://release.solana.com/v1.18.1/solana-install-init.exe" -OutFile "$env:TEMP\solana-install-init.exe" -UseBasicParsing
& "$env:TEMP\solana-install-init.exe" v1.18.1
```

*Note: After installation, restart your terminal.*

#### Troubleshooting: 'solana' not recognized

#### Troubleshooting: 'solana' not recognized
If `solana --version` still doesn't work after restarting:
1.  Verify the folder exists: `ls $env:USERPROFILE\.local\share\solana\install\active_release\bin`
2.  Manually add it to your PATH:
    ```powershell
    $solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
    [Environment]::SetEnvironmentVariable("Path", $env:Path + ";" + $solanaPath, "User")
    ```
3.  **Close and reopen PowerShell**.

### Install Anchor CLI
Anchor requires **Rust** and **Solana CLI**. If you have Rust installed, run:
```powershell
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Acquiring Faucet Tokens

The CLI `solana airdrop` command is often rate-limited. If it fails, use these alternatives:

#### Alternative A: Web Faucet (Recommended)
1.  **In WSL**, get your wallet address: `solana address`
2.  **In your Windows browser**, go to [faucet.solana.com](https://faucet.solana.com/)
3.  Paste your address and request 1 SOL on **Devnet**.

#### Alternative B: PoW Faucet (If Web fails)
1.  Go to [solfaucet.com](https://solfaucet.com/)
2.  Input your address and select **Devnet**.

#### Alternative C: Try smaller amounts in CLI
```bash
solana airdrop 0.5
solana airdrop 0.2
```

Once `solana balance` shows more than 0 SOL, we are ready to build!

---

## 3. Install Rust & Anchor (Final Step before Deploy)

## 3. Preparation for Deployment

Once you have the tools and SOL:
1. Run `solana config set --url devnet`.
2. Ensure you have a keypair generated: `solana-keygen new` (if you don't have one).
3. Build the program: `anchor build`.
4. Deploy: `anchor deploy`.

---
**I am ready to assist with the build and deployment commands once the tools are installed!**
