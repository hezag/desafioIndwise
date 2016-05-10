/**
 * ProductController
 *
 * @description :: Server-side logic for managing products
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index:  function (req, res) {
		res.json('oi. use /summary');
	},
	summary: function (req, res) {
		Production.native(
			function(err,collection) {
				collection.aggregate(
					[
		        {
		          "$group" : {
		              // agrupa pelos 10 primeiros digitos do 'pt' (XXXX-XX-XX)
		              "_id" : { $substr : ["$pt", 0, 10 ] },
		              "count" : { "$sum" : 1 },
		              "avg_sis" : { $avg: "$sis" },
		              "min_sis" : {
		                $min: {
		                  /*
		                    pequeno workaround:
		                    usa o valor absoluto do $sis, para ignorar os itens com
		                    $sis -1 (o primeiro de cada dia?), e assim conseguir pegar o
		                    menor valor $sis de verdade

		                    o $abs só está disponível no mongodb 3.2+, usei esse condicional
		                    pra obter o mesmo resultado
		                  */
		                  $cond: {
		                    if: { $gt: [ "$sis", 0 ] },
		                    then: "$sis",
		                    else: { $multiply: ["$sis", -1] }
		                  }
		                }
		              },
		              "max_sis" : { $max: "$sis" },
		              //"sd_sis" : { $stdDevPop: "$sis" }, // só pra mongodb 3.2+ :(
		              "sd_sis_1":{$sum:"$sis"},
		              "sd_sis_2":{$sum:{$multiply:["$sis","$sis"]}}
		          }
		        },
		        {
		          "$project": {
		            date: '$_id',
		            count: 1,
		            avg_sis: 1,
		            min_sis: 1,
		            max_sis: 1,

		            sd_sis_1: 1,
		            sd_sis_2: 1,

		            _id: 0
		          }
		        }
		      ],
					function(err, prod) {
		        var data = {

		          "production": prod.map(
		            function(a){
		              return {
		                date: a.date,//(new Date(a.date)).toISOString(),
		                min_sis: a.min_sis,
		                max_sis: a.max_sis,
		                avg_sis: a.avg_sis.toFixed(3),
		                // método de calculo do d.p. encontrado em:
		                // https://www.snip2code.com/Snippet/36689/standard-deviation-MongoDB-aggregation-p
		                sd_sis: (Math.sqrt( a.count * a.sd_sis_2 - Math.pow( a.sd_sis_1, 2) ) / a.count).toFixed(3),
		                count: a.count,
		              }
		            }
		          ),
		          "total": (function(){
		            var t = 0;
		            for (var c in prod) { t += prod[c].count; }
		            return t;
		          })()
		        };
						res.json(data);
		      }
				);
			}
		);
	}
};
