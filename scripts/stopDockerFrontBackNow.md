# How to Use `stopDockerFrontBackNow.sh`

## Overview

This script is used to stop and remove running Docker containers for the *City Digital Twin* project.

It will:

1. Stop the following running Docker containers:
   - `city-digital-twin-backend`
   - `city-digital-twin-frontend`
   - `mnt-graphdb-1`

2. Remove the following Docker containers:
   - `city-digital-twin-backend`
   - `city-digital-twin-frontend`

---

## Usage

### 1. How to run

```bash
sudo bash stopDockerFrontBackNow.sh