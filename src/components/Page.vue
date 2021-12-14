<template>
<div id="wrap">
    <div id="box" class="el-upload el-upload--text" tabindex="0" >
      <div id="drop-box" class="el-upload-dragger" @click="SelectFile">
        <i class="el-icon el-icon--upload">
          <svg class="icon" width="200" height="200" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M544 864V672h128L512 480 352 672h128v192H320v-1.6c-5.376.32-10.496 1.6-16 1.6A240 240 0 0164 624c0-123.136 93.12-223.488 212.608-237.248A239.808 239.808 0 01512 192a239.872 239.872 0 01235.456 194.752c119.488 13.76 212.48 114.112 212.48 237.248a240 240 0 01-240 240c-5.376 0-10.56-1.28-16-1.6v1.6H544z">
          </path>
          </svg>
          </i>
          <div class="el-upload__text"> 将文件拖拽到此处或者点击选择要处理的文件 </div></div><input class="el-upload__input" type="file" name="file" multiple="" accept=""></div>
    <div id="describe" class="el-upload__tip">选择的文件必须大于57KB</div>
    <div id="content">
      <button @click="Clear" v-if="fileList.length!=0" class="el-button el-button--danger is-circle" type="button" style="--el-button-bg-color: #f56c6c; --el-button-border-color: #f56c6c; --el-button-hover-bg-color:rgb(247, 137, 137); --el-button-hover-border-color:rgb(247, 137, 137); --el-button-active-bg-color:rgb(221, 97, 97); --el-button-active-border-color:rgb(221, 97, 97);"><i class="el-icon"><svg class="icon" width="200" height="200" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M160 256H96a32 32 0 010-64h256V95.936a32 32 0 0132-32h256a32 32 0 0132 32V192h256a32 32 0 110 64h-64v672a32 32 0 01-32 32H192a32 32 0 01-32-32V256zm448-64v-64H416v64h192zM224 896h576V256H224v640zm192-128a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32zm192 0a32 32 0 01-32-32V416a32 32 0 0164 0v320a32 32 0 01-32 32z"></path></svg></i><!--v-if--></button> 
      <ul id="file-content" class="el-upload-list el-upload-list--text" v-if="fileList.length!=0">
        <li class="el-upload-list__item" :class="file.success?'is-success':''" tabindex="0"  v-for="(file,index) in fileList" :key="file.id" ><!--v-if--><a class="el-upload-list__item-name" >
          <i class="el-icon el-icon--document"><svg class="icon" width="200" height="200" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M832 384H576V128H192v768h640V384zm-26.496-64L640 154.496V320h165.504zM160 64h480l256 256v608a32 32 0 01-32 32H160a32 32 0 01-32-32V96a32 32 0 0132-32zm160 448h384v64H320v-64zm0-192h160v64H320v-64zm0 384h384v64H320v-64z"></path></svg></i> {{file.name}}</a>
          <label class="el-upload-list__item-status-label"><i class="el-icon el-icon--upload-success el-icon--circle-check"><svg class="icon" width="200" height="200" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 896a384 384 0 100-768 384 384 0 000 768zm0 64a448 448 0 110-896 448 448 0 010 896z"></path><path fill="currentColor" d="M745.344 361.344a32 32 0 0145.312 45.312l-288 288a32 32 0 01-45.312 0l-160-160a32 32 0 1145.312-45.312L480 626.752l265.344-265.408z"></path>
          </svg>
            </i>
          </label>
          <i class="el-icon el-icon--close" @click="DeletFile(index)">
          <svg class="icon" width="200" height="200" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M764.288 214.592L512 466.88 259.712 214.592a31.936 31.936 0 00-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1045.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0045.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 10-45.12-45.184z"></path></svg></i><!-- Due to close btn only appears when li gets focused disappears after li gets blurred, thus keyboard navigation can never reach close btn--><!-- This is a bug which needs to be fixed --><!-- TODO: Fix the incorrect navigation interaction -->
          <i class="el-icon--close-tip">press delete to remove</i></li>
        </ul>
        <div id="operation" v-if="fileList.length!=0">
          <el-button id="encode" type="primary" @click="Encode">编码</el-button>
          <el-button id="decode" type="primary" @click="Decode">解码</el-button>
        </div>
    </div>
</div>
</template>
<script >
let electron = require('electron');
import { ElNotification } from 'element-plus'
let fs = require('fs');
const os = require('os');
const sysType = os.type();
const { ipcRenderer } = electron;
const path = require('path')
//MP4 作为头部替换编码文件头
const  MP4=process.env.NODE_ENV !== 'production'?"./public/movie.mp4":path.join(__dirname,"/movie.mp4")
  export default {
    data() {
      return {
        fileList: [],
        count:0
      };
    },
    methods: {
      //文件拖拽
      drop(){
        let _this=this
        var holder=document.getElementById("drop-box");
        holder.addEventListener('drop',(e)=>{
        e.preventDefault();
        e.stopPropagation();
        var files=e.dataTransfer.files;
        for(const file of files){
          this.Addfile(file.path);
        }
        
});
//下面三个必须监听否则drop不会执行
 holder.addEventListener("dragleave",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  false;
      })
       holder.addEventListener("dragenter",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  true;
      })
       holder.addEventListener("dragover",function (e) {
        e.stopPropagation();
        e.preventDefault();
        _this.borderhover =  true
      })
      },
      //添加文件data可以是文件路径或者路径组成的数组
      Addfile(data){
        if(this.isArray(data))
        {
          for(const file of data)
          {
            if(this.IsSelect(file))continue;
            this.fileList.push({id:this.count,name:this.getFileName(file),path:file,suffix:file.substring(file.lastIndexOf(".")+1),success:false});
            this.count++;
          }
        }else{
          var file=data
          if(!this.IsSelect(file)){
                      this.fileList.push({id:this.count,name:this.getFileName(file),path:file,suffix:file.substring(file.lastIndexOf(".")+1),success:false});
          }
        }
        
      },
      isArray(o){
              return Object.prototype.toString.call(o)=='[object Array]';
              },
      Encode(){
        var count=0;
        for(var file of this.fileList){
          if(!this.FixFile(file,MP4)){
            count++;
            continue
          }
          fs.renameSync(file.path,file.path+".mp4");
          file.success=true;
          file.name+=".mp4";
          file.path+=".mp4";
          file.suffix="mp4";
        }
        this.SuccessTip(this.fileList.length-count)
      },
      Decode(){
        var count=0;
        for(var file of this.fileList){
          if(!this.RestoreFile(file,MP4)){
            count++;
            continue
          }
          fs.renameSync(file.path,file.path.substring(0,file.path.lastIndexOf(".")));
          file.success=true;
          file.name=file.name.substring(0,file.name.lastIndexOf("."));
          file.path=file.path.substring(0,file.path.lastIndexOf("."));
          file.suffix=file.name.substring(file.name.lastIndexOf(".")+1);
        }
        this.SuccessTip(this.fileList.length-count)
      },
      Clear(){
          this.fileList=[];
      },
      RestoreFile(file,mp4){
        if(file.suffix.toUpperCase()!="MP4")
        {
          this.ErrorTip('文件'+file.name+" 不是.mp4编码文件");
          return false
        }
        var path=file.path;
        var fileLength,fileStats;  
        fileStats=fs.statSync(path);
        fileLength=fileStats.size;
        var mp4Length,mp4Stats;
        mp4Stats=fs.statSync(mp4);
        mp4Length=mp4Stats.size;
        var fd=fs.openSync(path,"r+");
        var startBytes=Buffer.alloc(mp4Length);
        fs.readSync(fd,startBytes,0,mp4Length,0);
        if(startBytes.toString()!=fs.readFileSync(mp4).toString())
        {
          this.ErrorTip('文件'+file.name+" 是未编码文件");
          fs.closeSync(fd)
          return false
        }  
        fs.readSync(fd,startBytes,0,mp4Length,fileLength-mp4Length)
        fs.writeSync(fd,startBytes,0,mp4Length,0);
        fs.ftruncateSync(fd,fileLength-mp4Length);
        fs.closeSync(fd)
        return true
      },
      SelectFile(){
        ipcRenderer.send('addfile');
      },
      ErrorTip(str){
      ElNotification({
        title: '错误提示',
        message: str,
        position: 'bottom-right',
        type:'error'
      })
    },
    SuccessTip(num){
      ElNotification({
        title: '完成',
        message: '已处理'+num+'个文件',
        position: 'bottom-right',
        type:'info'
      })
    },
    //把mp4文件覆盖到头部，原文件头部放到末尾
      FixFile(file,mp4){
        var path=file.path;
        var fileLength,fileStats;  
        fileStats=fs.statSync(path);
        fileLength=fileStats.size;
        var mp4Length,mp4Stats;
        mp4Stats=fs.statSync(mp4);
        mp4Length=mp4Stats.size;
        if(fileLength<mp4Length || file.success)
        {
          this.ErrorTip('文件'+file.name+" 太小了");
          return false
        }
        var mp4Bit=fs.readFileSync(mp4);
        var fd=fs.openSync(path,"r+");
        var startBytes=Buffer.alloc(mp4Length);
        fs.readSync(fd,startBytes,0,mp4Length,0);
        fs.writeSync(fd,mp4Bit,0,mp4Length,0);
        fs.closeSync(fd);
        //注意：在Linux上以追加方式写入位置参数失效，因此先将头部写入再用appendFile写入否则在linux平台会出现问题
        fs.appendFileSync(path,startBytes);
        return true;
      },
      IsSelect(filePath){
        for(const file of this.fileList){
          if(filePath==file.path)
            return true
        }
        return false
      },
      DeletFile(key){
       this.fileList.splice(key,1);
      },
       getFileName(path){
    if(sysType=="Windows_NT"){
        return path.substring(path.lastIndexOf('\\')+1);
    }else{
        return path.substring(path.lastIndexOf('/')+1);
    }
},
    },
    mounted: function () {

        ipcRenderer.on('filelist',(event,arg)=>{
          this.Addfile(arg);
          })
        this.drop()
      }
  }
</script>
<style>
#describe{
  text-align: center;
}
#box{
  width: 100%;
}
#box>div{
  margin: 0 auto;
}
#content{
  width: 500px;
  margin: 0 auto;
}
#file-content{
  border: 1px dashed #d9d9d9;
  margin-top: 10px;
  padding:2px 0 6px 0;
  border-radius: 8px;
}
#operation{
  margin-top: 10px;
}
#encode{
  float:left;
}
#decode{
    float:right;
}
.hint{
  display: flex;
  align-items: center;
}
</style>