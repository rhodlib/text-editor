const readline = require('readline');
const Messages = require('./messages');
const Document = require('./document');
const Directory = require('./directory');

const dir = new  Directory();

let interface = readline.createInterface(process.stdin, process.stdout);

const tools = `Commands: :q = exit, :sa = save as, :s = save
------------------------------------------------------------`;

const screen = `
                    =================
                    Text Editor.
                    =================
                    Choose an option
                    1 - New document
                    2 - Open document
                    3 - Close editor
`;

mainScreen();

function mainScreen() {
    process.stdout.write('\033c');

    interface.question(screen, res => {
        switch(res.trim()) {
            case '1':
                createFile();
                break;
            case '2':
                openFileInterface();
                break;
            case '3':
                interface.close();
                break;
            default:
                mainScreen();
                break;
        }
    });
}

function createFile() {
    let file = new Document(dir.getPath());

    renderInterface(file);
    readCommands(file);
}

function openFileInterface() {
    let file = new Document(dir.getPath());

    dir.getFilesInDir();

    interface.question(Messages.requestFileName, name => {
        if(file.exists(name)) {
            openFile(file, name);
        }else {
            console.log(Messages.fileNotFound);
            setTimeout(()=> {
                interface.removeAllListeners('line');
                mainScreen();
            }, 2000);
        }
    })
}

function openFile(file, name){
    file.open(name);

    renderInterface(file);
    readCommands(file);
}

function renderInterface(file, message) {
    process.stdout.write('\033c');
    (file.getName() == '') ? console.log(`| Untitled |`) : console.log(`| ${file.getName()} |`)

    console.log(tools);

    if(message != null) console.log(message)
    
    console.log(file.getContent());
}

function readCommands(file) {
    interface.on('line', input => {
        switch(input.trim()) {
            case ':sa':
                saveAs(file);
                break;
            case ':s':
                save(file)
                break;
            case ':q':
                interface.removeAllListeners('line');
                mainScreen();
                break;
            default:
                file.append(input.trim());
        }
    });
}

function saveAs(file) {
 interface.question(Messages.requestFileName, name => {
     if(file.exists(name)){
         console.log(Messages.fileExists);
         interface.question(Messages.replaceFile, confirm => {
             if(confirm == 'y') {
                file.saveAs(name);
                renderInterface(file, Messages.fileSaved + '\n');
             }else {
                 renderInterface(file, Messages.fileNotSaved + '\n');
             }
         });
     }else {
         // the file doesn't exist.
         file.saveAs(name);
         renderInterface(file, Messages.fileSaved);
     }
 });
}

function save(file) {
    if(file.hasName()){
        file.save();
        renderInterface(file, Messages.fileSaved + '\n');
    }else {
        saveAs(file);
    }
}