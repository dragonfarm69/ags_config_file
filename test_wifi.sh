#!/bin/bash

IFACE="wlo1"  # change to your interface: run `ip link`

# Get initial counters
prev_rx=$(cat /proc/net/dev | grep $IFACE | awk '{print $2}')
prev_tx=$(cat /proc/net/dev | grep $IFACE | awk '{print $10}')

while true; do
    sleep 1

    rx=$(cat /proc/net/dev | grep $IFACE | awk '{print $2}')
    tx=$(cat /proc/net/dev | grep $IFACE | awk '{print $10}')

    down=$((rx - prev_rx))
    up=$((tx - prev_tx))

    prev_rx=$rx
    prev_tx=$tx

    # Convert to human readable speed
    down_kb=$(echo "$down / 1024" | bc)
    up_kb=$(echo "$up / 1024" | bc)

    echo "↓ ${down_kb} KB/s | ↑ ${up_kb} KB/s"
done
