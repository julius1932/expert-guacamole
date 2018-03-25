var request = require('request');
var cheerio = require ("cheerio");
var async= require("async");
//var details = require('./scraper');
var TheUrl = [];
var MyLink='https://www.iodine.com/drug';

    async.series([

        function(callback){
            request('https://www.iodine.com/drug', function (error, response, body) {
                if (error) return callback(error); 
                var $ = cheerio.load(body);
                //Some calculations where I get NewUrl variable...

				$('li.col').each(function(){
		           var clink=$(this).find('a').first().attr('href');
				   if(clink.includes("drug")){
					   clink= 'https://www.iodine.com'+clink;
					   TheUrl.push(clink);					   
		               console.log(clink);
				   }
				   
	           });
                callback();
            });
        },
        function(callback){
            for (var i = 0; i <=TheUrl.length-1; i++) {
				console.log("ppppppppppppppppppppppppppppppppppppppppp   log "+i);
                var url = TheUrl[i];
                var item={
					 drug: "",
					 bottom_line:"",
		             Upsides:"",
		             Downsides:"",
		             how_it_works:"",
		             used_for:"",
		             facts:"",
		             side_effects:""
                };	
                request(url,function (error, response, html) {
	                   var $ = cheerio.load(html);
	
    $('div.depth-1').each(function(){
		var key=$(this).find('p.small').first().text().trim();       	
		//console.log(key);
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
	console.log(item);
});

            }
        }
      ], function(error){
        if (error) return error;
    });