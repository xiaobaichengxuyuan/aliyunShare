let electron = require('electron');
let fs = require('fs');
const os = require('os');
const sysType = os.type();
const { deflateSync } = require('zlib');
const { ipcRenderer } = electron;
const PNG="89504e470d0a1a0a0000";

let holder=document.querySelector("#holder");
var allFile=new Array();
holder.addEventListener('drop',(e)=>{
    e.preventDefault();
    e.stopPropagation();
    var files=e.dataTransfer.files;
    var fileList=document.getElementById("file-list");
    for(const file of files){
        if(allFile[file.path])
            continue;
        allFile[file.path]=file.path;
        fileList.appendChild(creatUpload(file.path,file.name));
    }
});
holder.addEventListener('click',SelectFile)

function SelectFile(e){
   ipcRenderer.send('addfile');
}
ipcRenderer.on('filelist',(event,arg)=>{
    var fileList=document.getElementById("file-list");
    for(const file of arg)
    {
       var name=getFileName(file);
       if(allFile[file])
            continue;
            allFile[file]=file;
            fileList.appendChild(creatUpload(file,name));
    }
})
holder.addEventListener('dragover',(e)=>{
    e.preventDefault();
    e.stopPropagation();
})
function getFileName(path){
    /*var pos1 = path.lastIndexOf('/');
    var pos2 = path.lastIndexOf('\\');
    var pos  = Math.max(pos1, pos2)
    if( pos<0 )
        return path;
    else
        return path.substring(pos+1);*/
    if(sysType=="Windows_NT"){
        return path.substring(path.lastIndexOf('\\')+1);
    }else{
        return path.substring(path.lastIndexOf('/')+1);
    }
}
function getPath(path){
    if(sysType=="Windows_NT"){
        return path.substring(0,path.lastIndexOf('\\')+1);
    }else{
        return path.substring(0,path.lastIndexOf('/')+1);
    }
}
function creatUpload(path,name){
    var path=path;
    var name=name;
    var father=document.createElement("div");
    father.classList.add("upload-info");
    var img=document.createElement("img");
    var node = document.createTextNode(name);
    var name=document.createElement("span");
    name.appendChild(node );
    name.classList.add("file-name");
    img.src="./static/file.png";
    img.classList.add("upload-img");
    var deleteBnt=document.createElement("img");
    deleteBnt.src="./static/delete.png"
    deleteBnt.classList.add("delete-bnt");
    deleteBnt.addEventListener('click',DeleteFile);
    father.setAttribute("path",path);
    father.appendChild(img);
    father.appendChild(name);
    father.appendChild(deleteBnt);
    return father
  }
function DeleteFile(e){
    var fileList=document.getElementById("file-list");
    fileList.removeChild(e.path[1]);
    delete allFile[e.path[1].getAttribute("path")];
    //splice
 }
var encodeBnt=document.getElementById("encode");
var decodeBnt=document.getElementById("decode");
encodeBnt.addEventListener("click",Encode);
decodeBnt.addEventListener("click",Decode);
function Encode(){
    FileEmpty(allFile);
    for(var file in allFile){
        if(IsEncodeFile(allFile[file]))
            continue;
        var hexName=fixFile(allFile[file]);
        if(hexName)
        fs.renameSync(allFile[file],allFile[file]+"_"+hexName+".png");
    } 
}
function Decode(){
    FileEmpty(allFile);
    for(var file in allFile){
        if(!IsEncodeFile(allFile[file]))
            continue;
        RestoreFile(allFile[file]);
        fs.renameSync(allFile[file],allFile[file].substring(0,allFile[file].lastIndexOf("_")));
    } 
}
function FileEmpty(file){
    if(!Object.keys(file).length){
        ipcRenderer.send('fileempty');
    }
}
function IsEncodeFile(filePath){
    var suffix=filePath.substring(filePath.lastIndexOf(".")+1).toUpperCase();
    if(suffix=="PNG")
    {
        return true;
    }
    return false

}
function fixFile(path)
{  
    var fileLength,fileStats;  
    fileStats=fs.statSync(path);
    fileLength=fileStats.size;
    var length = 128;
    if(fileLength>128){
        var fd=fs.openSync(path,"r+",);
        var startBytes=Buffer.alloc(length);
        var endBytes=Buffer.alloc(length);
        var bytes=HexToByteArray(PNG);
        fs.readSync(fd,startBytes,0,length,0);
        fs.readSync(fd,endBytes,0,length,fileLength-length);
        var hexName = BytesToHex(endBytes.slice(0,10));
        fs.writeSync(fd,endBytes,0,length,0);
        fs.writeSync(fd,bytes,0,bytes.length,0,);
        fs.writeSync(fd,startBytes,0,length,fileLength-length);
        fs.closeSync(fd);
        return hexName;
    }else{
        console.log("文件太小");
        return ;
    }
}
function RestoreFile(path){
    var restoreCode=path.substring(path.lastIndexOf("_")+1,path.lastIndexOf("."));
    var fileLength,fileStats;  
    fileStats=fs.statSync(path);
    fileLength=fileStats.size;
    var length = 128;
    if(fileLength>128){
        var fd=fs.openSync(path,"r+",);
        var startBytes=Buffer.alloc(length);
        var endBytes=Buffer.alloc(length);
        var bytes=HexToByteArray(restoreCode);
        fs.writeSync(fd,bytes,0,bytes.length,0);
        fs.readSync(fd,startBytes,0,length,0);
        fs.readSync(fd,endBytes,0,length,fileLength-length);
        fs.writeSync(fd,endBytes,0,length,0);
        fs.writeSync(fd,startBytes,0,length,fileLength-length);
        fs.closeSync(fd);
        return ;
    }else{
        console.log("文件太小");
        return ;
    }
    
}
function HexToByteArray(inHex){
    var hexlen=inHex.length;
    var hexArray=new Array();
    if(hexlen%2 ==1){
        hexlen++;
        inHex="0"+inHex;
    }
    for(var i=0;i<hexlen;i=i+2)
    {
        hexArray.push(parseInt("0x"+inHex.substring(i,i+2)));
    }
    return new Uint8Array(hexArray);
    
}
function  BytesToHex(bytes){
    var result=new String();
    for(const byte of bytes){
        if(byte<16)
            result+="0"+byte.toString(16);
        else
            result+=byte.toString(16);
    }
    return result.toUpperCase();
}
