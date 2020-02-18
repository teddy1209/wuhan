<template>
    <div class="HelloWorld">
        <div class="allCount">
            <span class="allConfirmedCount">确诊:{{allConfirmedCount}},</span>
            <span class="allSuspectedCount">疑似:{{allSuspectedCount}},</span>
            <span class="allCuredCount">治愈:{{allCuredCount}},</span>
            <span class="allDeadCount">死亡:{{allDeadCount}}</span>
        </div>
        <echarts ref="echarts" :options="options" :auto-resize="true" @click="onclick"></echarts>
        <div class="return">
            <el-button 
                v-if="!mapOfChina" 
                @click="drawMap" 
                class="returnBtn"
            >返回</el-button>
        </div>
        <div class="table">
            <el-table
                    :data="tableData"
                    stripe
                    style="width: 100%">
                <el-table-column
                    prop="provinceName"
                    label="省份"
                    v-if="mapOfChina">
                </el-table-column>
                <el-table-column
                    prop="cityName"
                    label="城市"
                    v-if="!mapOfChina">
                </el-table-column>
                <el-table-column
                    prop="confirmedCount"
                    label="确诊">
                </el-table-column>
                <el-table-column
                    prop="suspectedCount"
                    label="疑似">
                </el-table-column>
                <el-table-column
                    prop="curedCount"
                    label="治愈">
                </el-table-column>
                <el-table-column
                    prop="deadCount"
                    label="死亡">
                </el-table-column>
            </el-table>
        </div>
        <div class="rumors">
            <h1>谣言查询</h1>
            <el-input 
                v-model="word" 
                placeholder="请输入关键词" 
                suffix-icon="el-icon-search"
                @keyup.enter.native="identifyRumors(word)"
            ></el-input>
            <div v-if="!rumors" class="noData">暂无数据</div>
            <div class="rumor" v-for="rumor in rumors" :key="rumor.id">
                <p class="time">时间:{{rumor.date}}</p>
                <h3 class="title">{{rumor.title}}</h3>
                <p class="explain" :style="{ color: explainColor(rumor.explain) }">{{rumor.explain}}</p>
                <p class="desc">{{rumor.desc}}</p>
                <p class="author">来源:{{rumor.author}}</p>
            </div>
        </div>
    </div>
</template>

<script>
import { get,post } from '@/http/http.js';
import 'echarts/map/js/china';

let provinces = {
    '上海':'shanghai', '河北':'hebei','山西':'shanxi','内蒙古':'neimenggu','辽宁':'liaoning','吉林':'jilin','黑龙江':'heilongjiang',
    '江苏':'jiangsu','浙江':'zhejiang','安徽':'anhui','福建':'fujian','江西':'jiangxi','山东':'shandong','河南':'henan','湖北':'hubei',
    '湖南':'hunan','广东':'guangdong','广西':'guangxi','海南':'hainan','四川':'sichuan','贵州':'guizhou','云南':'yunnan',
    '西藏':'xizang','陕西':'shanxi1','甘肃':'gansu','青海':'qinghai','宁夏':'ningxia','新疆':'xinjiang', '北京':'beijing', 
    '天津':'tianjin', '重庆':'chongqing', '香港':'xianggang', '澳门':'aomen', '台湾':'taiwan'
}
export default {
    name: 'HelloWorld',
    data(){
        return {
            options: {},
            mapOfChina: true,
            news: [],
            desc: {},
            page: 1,
            provinces: [],
            allConfirmedCount: 0,
            allSuspectedCount: 0,
            allCuredCount: 0,
            allDeadCount: 0,
            maxConfirmedCount: 0,
            mapData: [],
            citiesData: {},
            tableData: [],
            rumors: [],
            word: '新型冠状病毒'
        };
    },
    computed:{
        explainColor(explain){
            return function(explain){
                let a = explain.slice(0,1)
                if(a == '真'){
                    return '#7fb80e'
                }else if(a == '假'){
                    return 'red'
                }else{
                    return '#ffc20e'
                }
            }
        }
    },
    created(){
        this.getNews()
        this.getCities()
        this.identifyRumors(this.word)
    },
    mounted(){
        this.$nextTick(() => {
            this.drawMap()
            // this.onclick()
        })
    },
    methods: {
        getNews(){
            get('http://api.tianapi.com/txapi/ncov/index', {key:'e03ed6e3fc608380d8ea9fea09fa9755'}).then(res=>{
                this.news = res.data.newslist[0].news;
                this.desc = res.data.newslist[0].desc;
            })
        },
        getCities(){
            get('http://api.tianapi.com/txapi/ncovcity/index', {key:'e03ed6e3fc608380d8ea9fea09fa9755'}).then(res=>{
                this.provinces = res.data.newslist;
                this.tableData = this.provinces
                for (let province of this.provinces) {
                    this.allConfirmedCount += province.confirmedCount;
                    this.allSuspectedCount += province.suspectedCount;
                    this.allCuredCount += province.curedCount;
                    this.allDeadCount += province.deadCount;
                    this.maxConfirmedCount = province.confirmedCount > this.maxConfirmedCount?province.confirmedCount:this.maxConfirmedCount;
                    let name = province.provinceName.replace(/省|市|自治区|维吾尔|回族|壮族/g,"");
                    
                    this.mapData.push(
                        {
                            name: name,
                            value: province.confirmedCount
                        }
                    );
                    this.citiesData[name] = province.cities;
                }
            })
        },
        identifyRumors(word){
            get('http://api.tianapi.com/txapi/rumour/index', 
            {
                key: 'e03ed6e3fc608380d8ea9fea09fa9755',
                word: word,
                num: 10,
                page: this.page
            }).then(res=>{
                this.rumors = res.data.newslist
            })
        },
        drawMap() {
            this.mapOfChina = true
            this.tableData = this.provinces
            this.options = {
                visualMap: {
                    min: 0,
                    max: 1500,
                    text: ['High', 'Low'],
                    realtime: false,
                    calculable: true,
                    inRange: {
                        color: ['white', '#f8aba6', 'red' , '#973c3f' , '#7a1723' , '#53261f']
                    }
                },
                series: [{
                    type: 'map',
                    map: 'china',
                    label: {
                        show: true
                    },
                    data: this.mapData
                }]
            }
        },
        onclick(param){
            this.mapOfChina = false;
            let city = param.name;
            let pinyin = provinces[city];
            require(`echarts/map/js/province/${pinyin}`)
            this.tableData = this.citiesData[city]
            for (let i of this.citiesData[city]) {
                i.name = i.cityName.slice(-1) == '区' || i.cityName.slice(-1) == '盟' || i.cityName.slice(-1) == '市'?
                i.cityName : i.cityName+'市';
                if(i.name == '大兴安岭市'){
                    i.name = '大兴安岭地区'
                }
                if(i.name == '延边市'){
                    i.name = '延边朝鲜族自治州'
                }
                i.value = i.confirmedCount;
            }
            this.options = {
                visualMap: {
                    min: 0,
                    max: 1500,
                    text: ['High', 'Low'],
                    realtime: false,
                    calculable: true,
                    inRange: {
                        color: ['white', '#f8aba6', 'red' , '#973c3f' , '#7a1723' , '#53261f']
                    }
                },
                series: [{
                    type: 'map',
                    map: city,
                    label: {
                        show: true
                    },
                    data: this.citiesData[city]
                }]
            }
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
.echarts {
    width: 100%;
    height: 600px;
}
.allCount{
    font-weight: bold;
    font-size: 24px;
    text-align: center;
    /* margin-left: 30px; */
}
.allConfirmedCount{
    color: #aa2116;
    margin-right: 30px;
}
.allSuspectedCount{
    color:#ffc20e;
    margin-right: 30px;
}
.allCuredCount{
    color:#7fb80e;
    margin-right: 30px;
}
.allDeadCount{
    color:gray;
    margin-right: 30px;
}
.returnBtn{
    height: 40px;
    width: 100px;
    border-radius: 5px;
    font-size:15px;
    float:right;
}
.return{
    overflow: hidden;
}
.table{
    margin-top: 30px;
}
.rumors{
    width: 100%;
}
.rumor{
    width: 90%;
    border: #D3D3D3 1px solid;
    border-radius: 15px;
    margin-top: 30px;
    padding: 10px 30px;
    box-sizing: border-box
}
.time{
    color: #696969;
    font-size: 15px;
}
.title{
    margin-top: 20px;
    color: #409eff;
    text-align: center;
    font-size: 20px;
}
.explain{
    /* color: red; */
}
.desc{
    text-align: justify;
}
.author{
    color: #696969;
    text-align: right;
    font-size: 15px;
}
.el-input{
    width: 90%;
}
.noData{
    width: 90%;
    height: 150px;
    line-height: 150px;
    text-align: center;
    color: #696969;
    font-size: 20px;
}
</style>
