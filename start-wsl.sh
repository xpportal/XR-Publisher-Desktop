#!/bin/bash

if grep -q Microsoft /proc/version; then
    echo "WSL detected - using WSL-specific configuration"
    
    # Kill any existing processes on port 5173
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
        echo "Killing process on port 5173"
        sudo kill -9 $(lsof -t -i:5173)
    fi
    
    # Check for required libraries
    if ! dpkg -l | grep -q libnss3; then
        echo "Installing required libraries..."
        sudo apt-get update
        sudo apt-get install -y libnss3-dev libgtk-3-dev libasound2-dev libdrm-dev mesa-utils
    fi
    
    # Set up X server properly
    export DISPLAY=$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):0
    export LIBGL_ALWAYS_INDIRECT=1
    
    # Set Node options for WSL2
    export NODE_OPTIONS='--max-old-space-size=4096'
    
    # Clean start the application
    ELECTRON_DISABLE_GPU=1 pnpm run start
else
    echo "Non-WSL environment - using standard configuration"
    pnpm run start
fi