# fLOW_postgres_server

Theoretically, this server would accept requests from the ESP8266 Wifi module and from those, update the Postgres server we have set up.
The server can be hit at 129.146.137.152/3000. To change the port number, edit this line in index.js:

`const port = 3000;`

### Run server in background

Sometimes it's nice to save the console.log in a file or just have the server running in the background. To do so, follow these steps:

1. First ensure there are no processes running on your port with `lsof -i:3000` where you may need to replace '3000' with your port number. lsof stands for LiSt Open Files, by the way. 
2. If there are processes running, kill them with `kill PID` where PID is the Process ID (it is a column in the lsof output)
    * Sometimes when I use just `kill PID` in process that was using npm, the process still exists, so in this case use `kill -9 PID` (which is like ultimate decapitation)
3. Run the command `npm start >~/log_file.log 2>err_file.err &`
    * If you would like the process to continue running even after you exit the VM, add `nohup` to the beginning of the command. This tells the terminal not to terminate the command upon logging out.
    * `npm start` could also be `node index.js` but note that only running `node index.js` will *NOT* reflect your changes if you update your files while server is running. 
    * `>~/log_file.log 2>err_file.err` means redirect the console.log to a file in the root directory called log_file.log and redirect standard error to a file in the root directory called err_file.err
    * The `&` means run this process in the background
4. If you would still like to see the console.log in real time, run `tail -f -n +1 ~/log_file.log`
5. Do **NOT** close the terminal window, instead use `exit` to logout of the VM. Closing the window will still terminate the process.
