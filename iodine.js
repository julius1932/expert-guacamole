var request = require('request');
var cheerio = require ("cheerio");
var async= require("async");
var mongoS = require("./mongoSave")// including the code to save json to mongo
var TheUrl = [];
var details = [];
var promisez=[];
function onCompleteAllRequests(){
    //We should have all the details now before calling this function
    console.log(" onCompleteAllRequests ");
    console.log(details);
}
function requestPage(url, callback) {
  return new Promise(function(resolve, reject) {
      // Do async job
        request(url, function(err, resp, body) {
            if (err) {
                reject(err);
                callback();
            } else {
                resolve(body);
            }
        })
    })
}
var MyLink='https://www.iodine.com/drug';
    async.series([
        function(callback){
            request('https://www.iodine.com/drug', function (error, response, body) {
                if (error) {
                	return callback(error);
                } 
                var $ = cheerio.load(body);
				$('li.col').each(function(){
		           var clink=$(this).find('a').first().attr('href');
				   if(clink.includes("drug")){
					   clink= 'https://www.iodine.com'+clink;
					   TheUrl.push(clink);					   
		               //console.log(clink);
				   }				   
	           });		
                callback();
            });
        },
         function(callback){       	
            for (var i = 0; i <=TheUrl.length-1; i++) {
				var url = TheUrl[i];

				//console.log(url+" "+i +" "+TheUrl.length);
				var splts=url.split('/');
				var drug=splts[splts.length-1];
                var item={
					drug: drug,
					bottom_line:"",
		            Upsides:"",
		            Downsides:"",
		            how_it_works:"",
		            used_for:"",
		            facts:"",
		            side_effects:""
                };	
                var requestPag = requestPage(url,callback);
                promisez.push(requestPag);
                if(i==TheUrl.length-1){
                  Promise.all(promisez).then(function(values) {
                     onCompleteAllRequests();
                });
                }
                requestPag.then(function(body) {
                var $ = cheerio.load(body);
                 scrapPage($,item);
                }, function(err) {
                console.log(err); 
                    return;   
                })
	                
            }
            mongoS.closeConnection();
            callback();
        },function(callback){   
        	 callback();
        }
        //onCompleteAllRequests()
       ], function(error){ // this will be called when all request are completed
            console.log("All request have been send now but not completed")   
            //onCompleteAllRequests();  	   
        }     
   );
  function scrapPage($,item){
    $('div.depth-1').each(function(){
	var key=$(this).find('p.small').first().text().trim();       	
    var valu="";
	var uls= $(this).find('ul.p-3 li').text();
    for (var i = 0; i <=uls.length-1; i++) {
	    valu+=uls[i]; 
    }
   if(key==="Upsides"){
	    item.Upsides=valu;
    }else if (key==="Downsides"){
	    item.Downsides=valu;
    }else if (key==="Used for"){
	    var usedArr =[];
	    $(this).find('ul.p-l-3 li.brd-grey-2 a').each(function(){
		     var usedOb={
			      link:'https://www.iodine.com/'+$(this).first().attr('href'),
			      purpose:$(this).text()
		        }
        usedArr.push(usedOb);	
		});
	   item.used_for=usedArr;
    }
		
	});
	var facts={
		   Drug_class:"",
	          Rx_status:"",
	                    Generic_status:""
	                };
	                $('div.brd-purple ul.p-3 li.m-b-1').each(function(){
		                var txt = $(this).text();
		                var txtArr =txt.split(":");
		                if(txtArr[0].trim()==="Drug class"&&txtArr.length>1){
			               facts.Drug_class=txtArr[1]
		                }else if(txtArr[0].trim()==="Rx status"&&txtArr.length>1){
			               facts.Rx_status=txtArr[1]
		                }else if(txtArr[0].trim()==="Generic status"&&txtArr.length>1){
			               facts.Generic_status=txtArr[1]
		                }
		
	                });
	                item.facts=facts;
	                var txtt=$('.fx .brd-purple p.p-3').text();
	                txtt=txtt.replace("Our bottom lineUpsidesDownsides","");
	                item.how_it_works=txtt;
	                item.bottom_line =$('div.col div.depth-1 h3.p-3').text();
	                var side_effects=[];
	                $('div.depth-1 .p-3 ul.fx li.col').each(function(){
		                side_effects.push($(this).text());
	                });
	                item.side_effects=side_effects;
	                
	                details.push(item);
	                mongoS.saveData(item);// saving json to mongodb
	                //console.log(item);
	                
               
  }