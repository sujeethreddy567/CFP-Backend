const router = require('express').Router();
const auth = require('./verifyToken')

// var data = require('../Data/College_details Task.json');

const dotenv = require('dotenv');

dotenv.config();

var data =[]
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
// Connection URL
const uri = process.env.DB_CONNECT;
const client = new MongoClient(uri, {
useNewUrlParser: true,
useUnifiedTopology: true,
});
async function run() {
try {
    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("CollegeFilter").command({ ping: 1 });
    console.log("Connected successfully to server");
    await client.db("CollegeFilter").collection('colleges').find().forEach(c=>{
    data.push(c)
    })
    data.forEach(Element=>{
        var temp = Element;
        var flist = temp.facilities.split(",");
        temp.facilities = flist;
        mydata.push(temp);
        var city_name = Element.city
        var state_name = Element.state
    
        if(state.includes(Element.state)==false){
            state.push(state_name)
            state_city[state_name]=[]
            state_city[state_name].push(city_name)
        }
        if(cities.includes(Element.city)==false){
            cities.push(city_name)
            if(state_city[state_name].includes(Element.city)==false){
                state_city[state_name].push(city_name)
            }
        }
        flist.forEach(facility=>{
            if(facilities.includes(facility)==false && facility!=""){
                facilities.push(facility);
            }
        })
    })
} finally {
    // Ensures that the client will close when you finish/error
    await client.close();

}
}
run().catch(console.dir);


console.log(data)
var mydata =[];
var cities = [];
var state = [];
var facilities =[];
var state_city=[];
console.log("Processed")

router.get('/render',auth,(req,res)=>{
    res.json({"auth":true,
        "table_data":mydata,
        "city_data":cities.sort(),
        "state_data":state.sort(),
        "facilities_data":facilities.sort(function(a, b){return b.length - a.length;})
    })
})

//RESPOND WITH LIST OF CITIES IN THAT STATE
router.post('/cities',auth,(req,res)=>{
    console.log(req.body.data)
    res.json({data:state_city[req.body.data]})
})
//FILTERING
router.post('/filter',auth,(req,res)=>{
    var response ={}
    var table_filter_data = mydata;
    var state_filter_data = state;
    var city_filter_data = cities;
    var facilities_filter_data = facilities; 
    console.log("filter data ",req.body)


    if(req.body.state && req.body.state!="***"){
        console.log("state filter")
        var temp =[]
        table_filter_data.forEach(ele=>{
            if(ele.state==req.body.state) temp.push(ele);
            ele.facilities.forEach(facility=>{
                if(!facilities_filter_data.includes(facility)&&facility!="") facilities_filter_data.push(facility)
            })
        })
        table_filter_data=temp;
        city_filter_data = state_city[req.body.state];
        response ={"filtered_table_data":table_filter_data,
                    "filtered_city_list":city_filter_data,
                    "filtered_facilities":facilities_filter_data}
    }


    if(req.body.city && req.body.city!="***"){
        console.log("city filter")
        var temp =[]
        table_filter_data.forEach(ele=>{ 
            if(ele.city==req.body.city)  temp.push(ele); 
            ele.facilities.forEach(facility=>{
                if(!facilities_filter_data.includes(facility)&&facility!="") facilities_filter_data.push(facility)
            })
        })
        table_filter_data=temp;
        response ={"filtered_table_data":table_filter_data,
                    "filtered_facilities":facilities_filter_data}
    }


    if(req.body.facilities && req.body.facilities.length != 0){
        console.log("facilities filter")
        var temp =[]
        var state_temp = [];
        var city_temp = []
        table_filter_data.forEach(ele=>{ 
            var flag = true;
            req.body.facilities.forEach(facility=>{   
                if(ele.facilities.includes(facility)==false) flag = false
            })
            if( flag==true ){
                if(temp.includes(ele) ==false) temp.push(ele);
                ele.facilities.forEach(facility=>{
                    if(!facilities_filter_data.includes(facility)&&facility!="") facilities_filter_data.push(facility)
                })
                if(!state_temp.includes(ele.state)) state_temp.push(ele.state);
                if(!city_temp.includes(ele.city)) city_temp.push(ele.city);
            } 
        })
        table_filter_data=temp;
        city_filter_data = city_temp;
        state_filter_data = state_temp;
        response ={"filtered_table_data":table_filter_data,
                    "filtered_facilities":facilities_filter_data,
                    "filtered_city_list":city_filter_data,
                    "filtered_state_list":state_filter_data}
    }
    if(req.body.search && req.body.city!=""){
        console.log("search");
        var temp=[]
        table_filter_data.forEach(college=>{
            if(college.name.includes(req.body.search)){
                temp.push(college)
            }
        })
        table_filter_data = temp
    }
    res.json({"table_data":table_filter_data,
    "city_data":city_filter_data,
    "state_data":state_filter_data,
    "facilities_data":facilities_filter_data,})
    table_filter_data = mydata;
})
module.exports = router;