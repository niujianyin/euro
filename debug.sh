#!/bin/bash

cd ~/workspace/svn/05/euro
sudo fis3 server clean
sudo fis3 server start -p 15080 
sudo fis3 release -w
