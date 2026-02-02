# Convex Deployment Guide

**Contact:** Please reach out to Jackson Romero (<jtromero@cmu.edu> or <jacksontromero@gmail.com>) for help with deployment or development on q'

This guide walks through deploying q' with the Convex backend on an AWS EC2 instance using Docker.

## Prerequisites

Before starting, you'll need:

- An AWS account
- A domain name (e.g., `cs122.andrew.cmu.edu`)
- Google Cloud Console access for OAuth credentials

## Step 1: Create an EC2 Instance

1. From the EC2 page in the AWS console, click **Launch instances**
2. **Name:** Give your instance a name (e.g., `q-prime-prod`)
3. **OS Image:** Select **Ubuntu** (22.04 LTS or later)
4. **Instance type:** Select `t3.small` or larger (t2.micro may be too small for Docker - check AWS free tier offerings, as of writing they offer c7i-flex.large in the free tier and it's much larger)
5. **Key pair:** Click **Create new key pair**
   - Name it (e.g., `q-prime-key`)
   - Select RSA and .pem format
   - Download and save the .pem file securely
6. **Network settings:**
   - Allow SSH traffic from your IP
   - Allow HTTPS traffic from the internet
   - Allow HTTP traffic from the internet
7. **Storage:** Increase to 30GB (free tier eligible)
8. Click **Launch Instance**

## Step 2: Configure Security Group

1. Select your instance and go to the **Security** tab
2. Click on the Security Group link
3. Click **Edit inbound rules**
4. Ensure you have these rules:
   | Type | Port | Source |
   |-------|------|-----------|
   | SSH | 22 | Your IP |
   | HTTP | 80 | 0.0.0.0/0 |
   | HTTPS | 443 | 0.0.0.0/0 |

## Step 3: Connect Your Domain

1. Find your instance's **Public IPv4 address** in the Details tab
2. Add an **A record** to your domain's DNS pointing to this IP address
3. Wait for DNS propagation (can take a few minutes to hours)

## Step 4: Connect to Your Instance

```bash
# Make your key file secure
chmod 400 ~/path/to/q-prime-key.pem

# Connect via SSH
ssh -i ~/path/to/q-prime-key.pem ubuntu@<your-instance-public-ip>
```
