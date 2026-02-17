# Ubuntu Setup Guide for Termux (Android)

A comprehensive guide to installing and configuring Ubuntu on Android using Proot-distro and Termux.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Install Ubuntu](#install-ubuntu)
3. [System Configuration](#system-configuration)
4. [Create Regular User](#create-regular-user)
5. [Desktop Environment](#desktop-environment)
6. [Localization](#localization)
7. [One-Click Startup Script](#one-click-startup-script)

---

## Initial Setup

### Step 1: Install Required Packages

Update Termux and install Proot-distro, PulseAudio, and Vim:

```bash
pkg update
termux-setup-storage
pkg install proot-distro pulseaudio vim
```

**What this does:**
- `pkg update` - Updates Termux package manager
- `termux-setup-storage` - Configures storage permissions
- `proot-distro` - Tool to run Linux distributions in Termux
- `pulseaudio` - Audio daemon for desktop environment support
- `vim` - Text editor for configuration files

---

## Install Ubuntu

### Step 2: Install Ubuntu Distribution

```bash
proot-distro install ubuntu
```

### Step 3: Log In to Ubuntu

The `--user root` parameter logs in as root user, and `--shared-tmp` mounts the Termux tmp directory for X server resource sharing:

```bash
proot-distro login ubuntu --user root --shared-tmp
```

---

## System Configuration

### Step 4: Install Base System Tools

Once logged into Ubuntu as root:

```bash
apt update
apt install sudo vim software-properties-common
```

### Step 5: Disable Snap (Android Compatibility)

Since Android doesn't support Systemd, disable Snap to prevent issues:

```bash
cat <<EOF | sudo tee /etc/apt/preferences.d/nosnap.pref
# To prevent repository packages from triggering the installation of Snap,
# this file forbids snapd from being installed by APT.
# For more information: https://linuxmint-user-guide.readthedocs.io/en/latest/snap.html
Package: snapd
Pin: release a=*
Pin-Priority: -10
EOF
```

### Step 6: Install Firefox (Optional)

Install Firefox through Mozilla's PPA:

```bash
sudo add-apt-repository ppa:mozillateam/ppa
sudo apt-get update
sudo apt-get install firefox-esr
```

### Step 7: Exit Root Session

To exit the proot environment:

```bash
exit
```

---

## System Configuration (Continued)

### Step 8: Change Package Mirrors (Optional)

Changing mirrors can speed up package downloads. See [Official Archive Mirrors for Ubuntu](https://launchpad.net/ubuntu/+archivemirrors).

Example: Replace ports.ubuntu.com with NCHC Taiwan mirror:

```bash
sudo sed -i 's/ports.ubuntu.com/free.nchc.org.tw/g' /etc/apt/sources.list
apt update
```

---

## Create Regular User

### Step 9: Set Up User Account

Instead of using root, create a regular user account with sudo privileges.

**Change root password:**

```bash
passwd
```

**Add required groups:**

```bash
groupadd storage
groupadd wheel
groupadd video
```

**Create new user "user":**

```bash
useradd -m -g users -G wheel,audio,video,storage -s /bin/bash user
passwd user
```

**Grant sudo privileges:**

```bash
visudo
```

Find the line containing:
```
root ALL=(ALL:ALL) ALL
```

Add the following line below it:
```
user ALL=(ALL:ALL) ALL
```

**Switch to regular user:**

```bash
su user
cd
```

---

## Desktop Environment

Choose and install ONE of the following desktop environments:

### Option 1: XFCE (Recommended for minimal resources)

```bash
sudo apt install xubuntu-desktop
sudo update-alternatives --config x-terminal-emulator
# Select xfce4-terminal
```

**Startup command:** `startxfce4`

### Option 2: KDE (Heavier, more features)

```bash
sudo apt install kubuntu-desktop
sudo update-alternatives --config x-terminal-emulator
# Select konsole
```

**Startup command:** `startplasma-x11`

### Option 3: GNOME (Experimental)

```bash
sudo apt install ubuntu-desktop
```

**Startup command:** `export XDG_CURRENT_DIR=GNOME && service dbus start && gnome-shell --x11`

---

## Localization

### Step 10: Configure Time Zone

Example: Set to Taipei, Taiwan

```bash
sudo ln -sf /usr/share/zoneinfo/Asia/Taipei /etc/localtime
```

Replace `Asia/Taipei` with your time zone.

### Step 11: Install Localization Tools

```bash
sudo apt install locales fonts-noto-cjk
```

### Step 12: Configure Language Settings

Edit `/etc/locale.gen`:

```bash
vim /etc/locale.gen
```

Find `en_US.UTF-8 UTF-8` (or your preferred language) and uncomment it (remove the `#`).

**Generate locale:**

```bash
locale-gen
echo "LANG=en_US.UTF-8" > /etc/locale.conf
```

### Step 13: Set Environment Variables

Edit `~/.profile`:

```bash
vim ~/.profile
```

Add the following at the end:

```bash
LANG=en_US.UTF-8
LC_CTYPE=en_US.UTF-8
LC_NUMERIC=en_US.UTF-8
LC_TIME=en_US.UTF-8
LC_COLLATE=en_US.UTF-8
LC_MONETARY=en_US.UTF-8
LC_MESSAGES=en_US.UTF-8
LC_PAPER=en_US.UTF-8
LC_NAME=en_US.UTF-8
LC_ADDRESS=en_US.UTF-8
LC_TELEPHONE=en_US.UTF-8
LC_MEASUREMENT=en_US.UTF-8
LC_IDENTIFICATION=en_US.UTF-8
LC_ALL=
```

---

## One-Click Startup Script

### Prerequisites

1. Exit the proot environment:
```bash
exit
exit
exit
```

2. **Install Termux Widget** from F-Droid or Google Play Store

3. **Enable permission:** Open phone system settings and enable "Allow display on top of other applications" for Termux

4. **Restart Termux** (force stop and reopen)

### Step 14: Create Startup Script

Create the shortcuts directory:

```bash
mkdir -p ~/.shortcuts
vim ~/.shortcuts/startproot_ubuntu.sh
```

Add the following content:

```bash
#!/bin/bash

# Kill all old processes
killall -9 termux-x11 pulseaudio virgl_test_server_android termux-wake-lock

# Start Termux X11
am start --user 0 -n com.termux.x11/com.termux.x11.MainActivity
XDG_RUNTIME_DIR=${TMPDIR}
termux-x11 :0 -ac &
sleep 3

# Start PulseAudio
pulseaudio --start --exit-idle-time=-1
pacmd load-module module-native-protocol-tcp auth-ip-acl=127.0.0.1 auth-anonymous=1

# Start GPU accelerated virglserver
virgl_test_server_android &

# Log in to proot Ubuntu and start the desktop environment
# Change 'startxfce4' to your chosen desktop environment command
proot-distro login ubuntu --user user --shared-tmp -- bash -c "export DISPLAY=:0 PULSE_SERVER=tcp:127.0.0.1; dbus-launch --exit-with-session startxfce4"
```

**Make it executable:**

```bash
chmod +x ~/.shortcuts/startproot_ubuntu.sh
```

### Step 15: Create Home Screen Shortcut

1. Go to your phone's home screen
2. Add a new widget → Select "Termux Widget"
3. The script `startproot_ubuntu.sh` will appear in the list
4. Tap to automatically launch Ubuntu with desktop environment

### Tips for Better Experience

- **Keyboard:** Use Hacker's Keyboard for easier command input
- **Touch Control:** Disable screen lock and screen saver in Ubuntu settings (proot cannot unlock)
- **Display Size:** Slide down the notification bar and access Termux X11 preferences
  - Change "Touch control" mode to simulate trackpad for mouse control
  - Adjust "Display resolution mode" to "Scaled" for better icon sizes

### Exiting Ubuntu

Press the "Exit" button on the Termux X11 notification bar, then force stop both Termux and Termux X11 apps.

---

## Troubleshooting

### PulseAudio Issues
Ensure PulseAudio is running and properly configured. Check the startup script for correct `PULSE_SERVER` settings.

### Display Issues
Verify Termux X11 is installed and running. Check display resolution settings in Termux X11 preferences.

### Permission Issues
If commands fail with permission denied, ensure you're using the correct user account and that sudo is properly configured.

---

## Additional Resources

- [Proot-distro Documentation](https://github.com/termux/proot-distro)
- [Termux Wiki](https://wiki.termux.com/)
- [Ubuntu Official Mirrors](https://launchpad.net/ubuntu/+archivemirrors)
- [Locale Configuration](https://wiki.archlinux.org/title/Locale)
