var request = require("request")
var cheerio = require("cheerio")
const fs = require('fs');

var page = 0;
var province = "livorno"
if (process.argv[2]!="")
    province = process.argv[2]
var url = "http://cercalatuascuola.istruzione.it/cercalatuascuola/ricerca/risultati?rapida="+province+"&tipoRicerca=RAPIDA&gidf=1&page=";
var schools = []


function extractFromPage(url)
{
    return new Promise(function(resolve,reject){
        request(url, function (error, response, body) {
            if (!error) {
              var $ = cheerio.load(body),
                results = $("#tabellaRisultati td ").find();
                let res = []
                var num_tds = results.prevObject.length
                for(var i = 1;i< num_tds; i = i+7)
                {
                    var school = {}
                    school.url = url
                    try
                    {
                        school.istitute = results.prevObject[i].children[1].children[0].data
                        school.address = results.prevObject[i+1].children[1].children[0].data
                        school.phone = results.prevObject[i+2].children[1].children[0].data
                        school.email = results.prevObject[i+3].children[1].children[0].data
                    }
                    catch(err)
                    {
                        console.log("some data missed... ")
                    }
                    res.push(school)
                    debugger;
                }
                resolve(res)
                
            } else {
                reject(error)
                console.log("We’ve encountered an error: " + error);
            }
        });
    }) 
}


request(url, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body),
        pages = $(".sc-pager span ").find().prevObject[0].children[0].data;
        pages = parseInt(pages.split("/")[1])
        console.log("ok i got ${pages} pages...")
        var req_array = []
        for(var i=0;i<pages;i++)
        {
            
            //console.log(url)
           
            req_array.push(extractFromPage(url+i)) 
        }
        debugger;
        Promise.all(req_array).then((results)=>{
            console.log(results)
            fs.writeFileSync(province+".csv","Istituto;"+"Indirizzo;"+"Telefono;"+"Email\n")
            results.forEach(element => {
                element.forEach((el)=>{
                    fs.appendFileSync(province+".csv",el.istitute+";"+el.address+";"+el.phone+";"+el.email+"\n")
                })
            });
        })
    } else {
      console.log("We’ve encountered an error: " + error);
    }
});

