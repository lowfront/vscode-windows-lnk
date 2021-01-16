# Windows lnk
Open the original file of the Windows shortcut(`.lnk`) file. If the file is not a file to be included in the project directory, but is a data file to be used in the project, you may want to edit it frequently. 

![preivew](https://raw.githubusercontent.com/lowfront/vscode-windows-lnk/master/preview.jpg)

## Usage
Copy the .lnk file from outside the project directory into your project using Windows `Create shortcut` feature. Automatically opens the file no matter which directory it is in. Don't forget to include the `.lnk` file in `.gitignore`.

## Limit
Currently, only files that can be edited by vcode are supported, and ***sadly binary files and folders are not supported***😭. The folder will be opened in a new window later or added to workspace.