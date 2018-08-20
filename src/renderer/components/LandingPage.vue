<style scoped>
  @import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

  /* * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  } */

  /* body {
    font-family: "Source Sans Pro", sans-serif;
  } */

  .wrapper {
    /* background: radial-gradient(
      ellipse at top left,
      rgba(255, 255, 255, 1) 40%,
      rgba(229, 229, 229, 0.9) 100%
    ); */
    background: #fff;
    height: 100vh;
    padding:5px;
    width: 100vw;
  }

  .serial-config{
    border:1px solid #d4d4d4; 
    padding: 0px 10px;
    padding-top: 20px;
    position: relative;
    min-width: 250px;
  }

  .serial-config::before{
        content:"配置串口";
        position:absolute;
        left:50%;
        top: 0;
        transform:translateX(-50%);
        -webkit-transform:translate(-50%,-50%);
        padding:0 10px;
        background-color:#fff;
        z-index: 1000
  }
  .message-body{
    width:100%;
  }

  .message-list {
    width: 100%;
    height:400px;
    margin-left: 5px;
    border: #d4d4d4 solid 1px;
    overflow-y: auto
  }

  .message-item {
    padding: 2px 5px;
    border-bottom: rgb(233, 233, 233) 1px solid;
    padding-right: 80px;
    position: relative;
    overflow-x: auto
  }
  .message-time{
    position: absolute;
    right: 0px;
  }
  .message-time::before{
    content: "<"
  }
</style>

<template>
  <div class="wrapper" style="padding-top:15px">
    <Row>
      <Col span="8">
        <div class="serial-config">
          <Form :model="serialForm" :label-width="50">
            <FormItem label="串口号">
              <Row >
                <Col span="20">
                 <Select v-model="serialForm.port">
                    <Option :key="item.value" :value="item.value" v-for="item in portList">{{item.label}}</Option>
                </Select>
                </Col>
                <Col span="4" style="padding-left:5px">
                <Button  size="small" icon="ios-refresh" @click="freshPort" ></Button>

                </Col>
              </Row>
               
            </FormItem>
            <FormItem label="波特率">
                <Select v-model="serialForm.baudRate">
                  <Option :key="item.value" :value="item.value" v-for="item in baudRateList">{{item.label}}</Option>

                </Select>
            </FormItem>
            <FormItem label="校验码">
                <Select v-model="serialForm.checkBit">
                  <Option :key="item.value" :value="item.value" v-for="item in checkBitList">{{item.label}}</Option>
                </Select>
            </FormItem>
            <FormItem label="数据位">
                <Select v-model="serialForm.dataBit">
                    <Option :key="item.value" :value="item.value" v-for="item in dataBitList">{{item.label}}</Option>
                </Select>
            </FormItem>
            <FormItem label="停止位">
                <Select v-model="serialForm.stopBit">
                    <Option :key="item.value" :value="item.value" v-for="item in stopBitList">{{item.label}}</Option>
                </Select>
            </FormItem>
            <FormItem>
              <Button type="primary" size="small" @click="operateSerial">{{portButtonLabel}}</Button>
            </FormItem>
          </Form>
        </div>
        <div>
            <Checkbox v-model="isHex">16进制显示</Checkbox>
             <Button @click="clearMessage" type="primary" size="small">清除</Button>
        </div>
        <div>

        </div>

      
      </Col>
      <Col span="16">
          <Row class="message-body">
            <div class="message-list">
              <div v-for="(item,index) in messageList" :key="index" class="message-item">
                <Icon v-if="item.type == 1" color="#ffcc00" type="md-arrow-round-up" />
                <Icon v-if="item.type == 2" color="#ff00ff" type="md-arrow-round-down" />
                <span>
                  {{item.data}}
                </span>
                <span class="message-time">
                  {{item.time}}
                </span>
              </div>
            </div>
        </Row>
        <Row>
          <Input v-model="sendData" >
                  <Select v-model="sendFormat" slot="prepend" placement='top' style="width: 80px">
                    <Option value="string">字符串</Option>
                    <Option value="hex">十六进制</Option>
                  </Select>
                  <Button slot="append" icon="android-send" @click="toSendData" style="background-color:#2d8cf0">发送</Button>
              </Input>
        </Row>

      
      </Col>
    </Row>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import SerialPort from 'serialport'
  import StringUtil from '../utils/StringUtil'


  export default {
    name: 'landing-page',
    components: { SystemInformation },
    data(){
      return{
          portList:[],
          baudRateList: [
          {
            value: 9600,
            label: '9600'
          },
          {
            value: 19200,
            label: '19200'
          },
          {
            value: 38400,
            label: '38400'
          },
          {
            value: 57600,
            label: '57600'
          },
          {
            value: 115200,
            label: '115200'
          }
        ],
        checkBitList:[
          {
          value: 'none',
          label: 'none'
        },
        {
          value: 'Even',
          label: 'Even'
        },
        {
          value: 'Odd',
          label: 'Odd'
        },
        {
          value: 'Mark',
          label: 'Mark'
        },
        {
          value: 'Space',
          label: 'Space'
        }
        ],
        dataBitList: [
        {
          value: 5,
          label: '5'
        },
        {
          value: 6,
          label: '6'
        },
        {
          value: 7,
          label: '7'
        },
        {
          value: 8,
          label: '8'
        }
      ],
      stopBitList: [
        {
          value: 1,
          label: '1'
        },
        {
          value: 1.5,
          label: '1.5'
        },
        {
          value: 2,
          label: '2'
        }
      ],
      serialForm:{
        port:null,
        baudRate:9600,
        checkBit:'none',
        dataBit:8,
        stopBit:1,
      },
      serialPort:null,
      connectStatus:false,
      portButtonLabel:'打开串口',
      portButtonColor:'primary',
      messageList:[],
      sendFormat:'string',
      sendData:null,
      isHex:false,
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      freshPort(){
              /* 清除现有的串口 */
        this.portList = []

        SerialPort.list( (err, ports) =>{
          console.log('串口列表')
          ports.forEach( (port) => {
          
            this.portList.push({
              value: port.comName,
              label: port.comName
            })
          })
          if(this.portList.length >0){
            this.serialForm.port = this.portList[0].value;
          }
        });
        
      },
      toSendData () {
        if (this.connectStatus === false) {
          this.$Message.info("没有打开串口");
          return
        }
        if(this.sendData === null || this.sendData.length === 0){
          this.$Message.info("请输入内容");
          return;
        }
        let data = null;
        if(this.sendFormat === 'string'){
          data = this.sendData;
        }else if(this.sendFormat === 'hex'){
          data = StringUtil.Str2Bytes(this.sendData);
          if(data === null){
            this.$Message.info("输入的参数不对");
            return;
          }
        }
        console.log(data);
        this.serialPort.write(data, err => {
          if (err) {
            this.$Message.error("发送失败，"+err.message);
          }else{
            this.messageList.push({
              type:1,
              data:this.sendData,
              time:new Date().toLocaleTimeString()
            });
          
          }
          
        })
      },
      operateSerial(){
          if(this.serialForm.port === null){
            this.$Message.warning("请选择端口");
          }
          if (this.connectStatus === true) {
            this.serialPort.close(err => {
              if (err) {
                this.$Message.error("关闭失败。原因："+ err.message);
                return console.log('Error closing port: ', err.message);
              }
              console.log('close ok')
              this.connectStatus = false
              this.portButtonLabel = '打开串口'
              this.portButtonColor = 'primary'
            })
            return;
          }

      let option = {
        baudRate: this.serialForm.baudRate,
        dataBits: this.serialForm.dataBit,
        stopBits:this.serialForm.stopBit,
        parity: this.serialForm.checkBit,
        autoOpen: false
      }

      this.serialPort = new SerialPort(this.serialForm.port, option, function (err) {
        if (err) {
          console.log('Error: ', err.message)
           this.connectStatus = false
              this.portButtonLabel = '打开串口'
              this.portButtonColor = 'primary'
        }
      })

      // Switches the port into "flowing mode"
      // curPort.on('data', function (data) {
      //   console.log('Data:' + data);
      // });

      // const Readline = SerialPort.parsers.Readline
      // const parser = new Readline({ delimiter: '\n' })
      // this.serialPort.pipe(parser)
      // parser.on('data', console.log)
      this.serialPort.on('data', result => {
        let data = null;
        if(!this.isHex){
          data = result.toString('utf8');
        }else{
          data = result.map((item,index) =>{
              return item.toString(16)
          }).join("");
        }
        let item = {
          type:2,
          data:data,
          time:new Date().toLocaleTimeString()
        }
        this.messageList.push(item);
      })

      // Read data that is available but keep the stream from entering "flowing mode"
      this.serialPort.on('error', function (err) {
        console.log('something error')
        console.log(err)
      })

      this.serialPort.open(err => {
        if (err) {
          return console.log('Error opening port: ', err.message)
        }
        console.log('open success')
        this.connectStatus = true
        this.portButtonLabel = '关闭串口'
        this.portButtonColor = 'error'
      })
    },
    clearMessage(){
      this.messageList = [];
    }
    
    },
    created(){
      this.freshPort();
    }
  }
</script>

