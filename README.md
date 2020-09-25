# fLOW_backend

This repository holds the backend server code for fLOW, a project dedicated to bringing awareness of excessive water usage in our homes.

For more information about the project in general, please check out our frontend repository [here](https://github.com/allisonchen23/fLOW_frontend).

This server accepts requests from the ESP8266 Wifi module to add water usage data and from those, update the Postgres server we have set up. The frontend client can also request to read data to from this server to display the user. We deployed this server on an Oracle Cloud Infrastructure Virtual Machine using NodeJS.

The server can be hit at 129.146.137.152/3000. To change the port number, edit this line in index.js:

`const port = 3000;`

### Run this server in background

We wanted the server to be able to run in the background so we didn't have to manually start it whenever we wanted to test the Arduino or UI code. There are two ways to do this. Method 1 is more suited for deployment and method 2 is more for development phases.

#### 1. Utilize systemd and OCI

Follow the instructions on these two blogs to set up the server so it's starts running when the instance is booted up. (Creds to Jeff Davies)
1. [Tutorial 1](https://medium.com/oracledevs/getting-started-with-oracle-cloud-infrastructure-6b048dad480c)
2. [Tutorial 2](https://medium.com/oracledevs/automatically-starting-your-web-server-2b7b793dfcb4)

#### 2. Use `nohup` to run the server in the background

1. First ensure there are no processes running on your port with `lsof -i:3000` where you may need to replace '3000' with your port number. lsof stands for LiSt Open Files, by the way. 
2. If there are processes running, kill them with `kill PID` where PID is the Process ID (it is a column in the lsof output)
    * Sometimes when I use just `kill PID` in process that was using npm, the process still exists, so in this case use `kill -9 PID` (which is like ultimate decapitation)
3. Run the command `npm start >~/log_file.log 2>err_file.err &`
    * If you would like the process to continue running even after you exit the VM, add `nohup` to the beginning of the command. This tells the terminal not to terminate the command upon logging out.
    * `npm start` could also be `node index.js` but` node index.js` will NOT show updated changes. You will have to kill the process and rerun the command
    * `>~/log_file.log 2>err_file.err` means redirect the console.log to a file in the root directory called log_file.log and redirect standard error to a file in the root directory called err_file.err
    * The `&` means run this process in the background
4. If you would still like to see the console.log in real time, run `tail -f -n +1 ~/log_file.log`
5. Do **NOT** close the terminal window, instead use `exit` to logout of the VM. Closing the window will still terminate the process.
