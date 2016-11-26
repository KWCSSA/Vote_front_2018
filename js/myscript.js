var pollInterval;
var pollCtr = 0;

var updateCandidatesFlag = true;
var pollflag = true;

function refresh(){
	$.ajax({
		type: 'GET' ,
		// url: 'http://test.tinnytian.com:8081/result',
		url: 'http://ituwcssa.com:8080/result',
		dataType: 'json',
		success: function(response){
			update(response);
		}
	});
}


function update(response){

	if (response.mode === 'vote' && response.state === "IDLE") {
                updateRound();
		// response is null do nothing
		$('h1').html("比赛进行中");
		hideAll();
		resetGlobalVars();
	}
	else if (response.state === 'ROUND'){
                        $('h1').html('投票结果');
                
                     updateRound();
                   
                }
                
	else if (response.mode === 'vote') {
		$("#poll").hide();
		
		// use a flag to avoid loading extra data
		if (updateCandidatesFlag) {
			updateCandidatesFlag = false;
			updateCandidatesInfo(response);
		}

		if (response.state === "VOTING"){
			var s = response.data.timerRemain;
			if (s <= 20) {
				s = '<span style="color:red">' + s + '</span>'
			}
			$('h1').html('投票进行中 ' + s);
			updateVotes(response);
		}
		else if (response.state === "VOTED"){
			$('h1').html('投票结束');
			updateVotes(response);
		}
		else if (response.state === 'RESULT'){
			$('h1').html('投票结果');
			updateResults(response);
		}

                        
	}
	else if (response.mode === 'poll' && pollflag) {
		pollflag = false;
		$('h1').html("抽奖");
		$('#voting').hide();
		$('#repechage').hide();
		$("#poll").show();

		pollInterval = setInterval(function(){updatepoll(response);},30);
	}
}

function updatepoll(response){
	// fake animation
	var s;
	// return a random number between 0 and 3
	var y = Math.floor((Math.random() * 4)); 
	switch (y) {
		case 0:
			s = "647";
			break;
		case 1:
			s = "226";
			break;
		case 2:
			s = "416";
			break;
		case 3:
			s = "519";
			break;
	}

	// random numbers from 0-9
	var x1=Math.floor((Math.random()*10));
	var x2=Math.floor((Math.random()*10));
	var x3=Math.floor((Math.random()*10));
	var x4=Math.floor((Math.random()*10));
	var x5=Math.floor((Math.random()*10));
	var x6=Math.floor((Math.random()*10));
	var x7=Math.floor((Math.random()*10));

	$('#poll').html(s+x1+x2+x3+x4+x5+x6+x7);
	// repeat 100 times
	pollCtr++;
	
	// display real value from server
	if (pollCtr >= 100) {
		clearInterval(pollInterval);
		$("#poll").html(response.winner[1]+response.winner[2]+response.winner[3]+"XXX"
			+response.winner[7]+response.winner[8]+response.winner[9]+response.winner[10]);
	}
}

// need to change for the final round
function computeTotal(votes, totalVotes, score, candidateNum) {
	// 60% from mentor, 40% from audiance, in another word,
	// a candidate can get 100 only if his mentor gives him 100
	// and he gets all audience's votes
	var total;
	if (totalVotes === 0) {
		// if an error occurs and no votes received, use score
		total = score * 0.6;
	}
        if(candidateNum == 1){
                total = votes/7 * 60 + score * 0.4 ;
        }
	else {
		// total = votes / totalVotes * 40 + score * 0.6;
		total = votes / totalVotes * 60 + score * 0.4;
	}
	return total.toFixed(2); // round to 2 decimals
}

function setProgressBar(id, val) {
  $(id).css('width', val+'%').attr('aria-valuenow', val); 
}	

function setHighlight(id) {
	$('#r_id'+id).css("background-color", "#428bca");
	$('#r_name'+id).css("background-color", "#428bca");
	$('#r_votes'+id).css("background-color", "#428bca");
}

function setHighlight_four(id) {
	$('#id'+id).css("background-color", "#428bca");
	$('#name'+id).css("background-color", "#428bca");
	$('#votes'+id).css("background-color", "#428bca");
}

function disableHighlight(id) {
	$('#r_id'+id).css("background-color", "");
	$('#r_name'+id).css("background-color", "");
	$('#r_votes'+id).css("background-color", "");

}

function disableHighlight_four(id) {
        $('#id'+id).css("background-color", "");
        $('#name'+id).css("background-color", "");
        $('#votes'+id).css("background-color", "");

}

// hide all sections, for resetting purpose
function hideAll() {
	$('#voting').hide();
	$('#poll').hide();
	$('#repechage').hide();
        $('#showfour').hide();
}

function resetGlobalVars() {
	updateCandidatesFlag = true;
	pollflag = true;
	pollCtr = 0;
}

function updateCandidatesInfo(response) {
       $('#showfour').hide();
	var candidateNum = response.data.candidates.length;
	// hide third column
	if (candidateNum <= 3) {
		// change table structure
                if (candidateNum === 1) {
                        $('#c_name0').hide();
                        $('table tr > :nth-child(2)').hide();
                        $('table tr > :nth-child(3)').hide();
                }
		if (candidateNum === 2) {
			// hide third column
			$('table tr > :nth-child(3)').hide();
		}
		else if (candidateNum === 3) {
			$('table tr > :nth-child(3)').show();
		}

		// update candidate information, id and name
		for (var i = 0; i < candidateNum; i++) {
			$('#c_id'+i).html(response.data.candidates[i].cid+"号");
		}
		for (var i = 0; i < candidateNum; i++) {
			$('#c_name'+i).html(response.data.candidates[i].name);
		}
	}
	// repechage
	else{
		for (var i = 0; i < candidateNum; i++) {
			$('#r_id'+i).html(response.data.candidates[i].cid+"号");
		}
		for (var i = 0; i < candidateNum; i++) {
			$('#r_name'+i).html(response.data.candidates[i].name);
		}
	}
}


function updateVotes(response) {
	var candidateNum = response.data.candidates.length;
        $('#showfour').hide();
	// repechage
	if (candidateNum === 8) {
//	if (candidateNum === 4) {
		$('#voting').hide();
		$('#repechage').show();
		for (var i = 0; i < candidateNum; i++) {
			disableHighlight(i)
			$('#r_votes'+i).html(response.data.candidates[i].votes+" 票");
		}
	}
	// competition
	else {
		$('#repechage').hide();
		$('#voting').show();
		$('#total').hide();
		// update score and votes
		for (var i = 0; i < candidateNum; i++) {
			$('#c_score'+i).html(response.data.candidates[i].score+" 分");
		}
		for (var i = 0; i < candidateNum; i++) {
			$('#c_votes'+i).html(response.data.candidates[i].votes+" 票");
		}
		// update progress bar
		var maxVotes = response.data.maxVotes;
		for (var i = 0; i < candidateNum; i++) {
			setProgressBar("#c_prog"+i, response.data.candidates[i].votes / 50 * 100);
		}
	}
}


function updateResults(response) {
       $('#c_name0').show();
	var candidateNum = response.data.candidates.length;
	// competition
	if (candidateNum < 3) {
		// calculate total votes
		var totalVotes = 0;
		for (var i = 0; i < candidateNum; i++) {
			totalVotes += response.data.candidates[i].votes;
		}
		// calculate total score
		for (var i = 0; i < candidateNum; i++) {
			var t = computeTotal(response.data.candidates[i].votes, totalVotes, response.data.candidates[i].score, candidateNum);
			$('#c_total'+i).html("总分 " + t);
		}
		$('#voting').show();
		$('#total').show();
		$('#repechage').hide();
                $('#showfour').hide();
	}
	// repechage
	else if (candidateNum === 8) {
//	else if (candidateNum === 4) {
		// find max
		var max = -1;
		var index;
		for (var i = 0; i < candidateNum; i++) {
			var votes = response.data.candidates[i].votes;
			if (votes > max) {
				max = votes;
				index = i;
			}
			// in case of multiple winners
			else if (votes === max) {
				index = index + "," + i;
			}
		}
		if (typeof index === "number") {
			setHighlight(index);
		}
		if (typeof index === "string") {
			var winners = index.split(",");
			for (var i in winners) {
				setHighlight(winners[i]);
			}
		}
		$('#voting').hide();
		$('#repechage').show();
                $('#showfour').hide();
	}
}
var highlight = 0;
var times = 0;
        $('#header').click(function(){
        for( var  i = times*2; i <times*2+2;i++){
        $('#name'+ i).html("");
        $('#id'+ i).html("");
        $('#votes'+ i).html("");
        console.log("clean");
}
        disableHighlight_four(1);
        disableHighlight_four(2);
        times+=1;
        highlight += 1;
});


 

function updateRound() {
        console.log("update");
        $('#voting').hide();
        $('#repechage').hide();
        $('#showfour').show();
          
             $.ajax({
                type: 'GET' ,
                url: 'http://ituwcssa.com:8080/round',
                dataType: 'json',
                success: function(res){
                    console.log(res);
               var number = res.length;
          if(number == 4){

          $('table tr > :nth-child(2)').show();
          $('table tr > :nth-child(3)').show();
          for(var i = 0; i < 4 ; i++){
        	$('#name'+ i).html( res[i].name);
           }
          for(var i = 0; i < 4 ; i++){
                $('#id'+ i).html( res[i].cid + "号");
           }

          if(times % 2 == 0){
          for(var i = 0; i < 4 ; i++){
                $('#votes'+ i).html("票数 " + res[i].vote);
           }}
          if(times % 2 == 1){
          for(var i = 0; i < 4 ; i++){
                $('#votes'+ i).html("总分 " + res[i].score);
          }}

          $('#showfour').click(function(){
             var max1 = 0;
  
for(var i = 0 ; i < 4 ; i++){
   if(res[i].score >= res[max1].score){
   	max1 = i;
   }
   else {
   }
}
setHighlight_four(max1);
})
}
else if (number == 3){
         
$('table tr > :nth-child(3)').show();
$('table tr > :nth-child(4)').hide();
          for(var i = 0; i < 3 ; i++){
                $('#name'+ i).html( res[i].name);
           }
          for(var i = 0; i < 3 ; i++){
                $('#id'+ i).html( res[i].cid + "号");
           }
        //  for(var i = 0; i < 3 ; i++){
        //        $('#votes'+ i).html("总分 " + res[i].score);
        //   }

          if(times % 2 == 0){
          for(var i = 0; i < 3 ; i++){
                $('#votes'+ i).html("票数 " + res[i].vote);
           }}
          if(times % 2 == 1){
          for(var i = 0; i < 3 ; i++){
                $('#votes'+ i).html("总分 " + res[i].score);
          }}

$('#showfour').click(function(){
             var max1 = 0;
   
for(var i = 0 ; i < 3 ; i++){
   if(res[i].score >= res[max1].score){
        max1 = i;
   }
   else {
   }
}
setHighlight_four(max1);
})
}

 else {


console.log(highlight);
console.log(times);  
console.log(res[times*2].name);      
$('table tr > :nth-child(4)').hide();
$('table tr > :nth-child(3)').hide();
         
        //  for(var i = times*2; i < times*2+2 ; i++){
                $('#name0').html( res[times*2].name);
                $('#name1').html( res[times*2+1].name);
               // console.log("did");
        //   }
        //  for(var i = times*2; i < times*2+2  ; i++){
        //        $('#id'+ i).html( res[i].cid + "号");
                $('#id0').html( res[times*2].cid + "号");
                $('#id1').html( res[times*2+1].cid + "号");

        //   }
        //  for(var i = 0; i < 2 ; i++){
        //        $('#votes'+ i).html("票数 " + res[i].vote);
        //   }

          if(highlight % 2 == 0){
                $('#votes0').html("票数 " + res[times*2].vote );
                $('#votes1').html("票数 " + res[times*2+1].vote );
          }
        //  for(var i = times*2; i < times*2+2  ; i++){
        //        $('#votes'+ i).html("票数 " + res[i].vote);
        //     }
      //     }}
      //    if(times % 2 == 1){
      //    for(var i = times; i < times+2  ; i++){
      //          $('#votes'+ i).html("总分 " + res[i].score);
      //    }}

        

$('#showfour').click(function(){
             var max1 = 0;

       for(var i = 0 ; i < 2 ; i++){
          if(res[i].score >= res[max1].score){
           max1 = i;
        }
        };
       setHighlight_four(max1);
       $('#votes0').html("总分 " + res[times*2].score);
       $('#votes1').html("总分 " + res[times*2+1].score);
       highlight += 1;
       console.log("did");
});
 }
  }                   
       });
}


$(document).ready(function(){
	setInterval(refresh,1000);
});

