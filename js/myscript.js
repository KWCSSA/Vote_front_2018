var pollInterval;
var pollCtr = 0;

var updateCandidatesFlag = true;
var pollflag = true;

function refresh(){
	$.ajax({
		type: 'GET' ,
		// url: 'http://test.tinnytian.com:8081/result',
		url: 'http://test.tinnytian.com:8081/result',
		dataType: 'json',
		success: function(response){
			update(response);
		}
	});
}


function update(response){
	console.log(response);

	if (response.mode === 'vote' && response.state === "IDLE") {
		$('h1').html("比赛进行中");
		hideAll();
		resetGlobalVars();
	} else if (response.mode === 'vote') {
		$("#poll").hide();
		
		// use a flag to avoid loading extra data
		if (updateCandidatesFlag) {
			updateCandidatesFlag = false;
			updateCandidatesInfo(response);
		}

		if (response.state == "SINGLE"){
			$("#result").hide();
			$("#single").show();
			$('h1').html('歌手演唱中');
		} 

		if (response.state === "VOTING"){
			$('#single').hide();
			var s = response.timerRemain/1000;
			if (s <= 20) {
				s = '<span style="color:red">' + s + '</span>'
			}
			$('h1').html('投票进行中 ' + s);
			updateVotes(response);
		}
		else if (response.state === "VOTED"){
			$('#single').hide();
			$('h1').html('投票结束');
			updateVotes(response);
		}
		else if (response.state === 'RESULT'){
			$('#single').hide();
			$('h1').html('投票结果');
			updateResults(response);
		}

                        
	}  else if (response.mode === 'poll' && pollflag) {
		pollflag = false;
		$('h1').html("抽奖");
		$('#voting').hide();
		$('#result').hide();
		$('#single').hide();
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

function setProgressBar(id, val) {

	//////////////////////////////////////////////
	// REBECCA implement update bar logic here
	//////////////////////////////////////////////

    $("#c_prog"+id).style.height = val + "px";
}	


// hide all sections, for resetting purpose
function hideAll() {
	$('#voting').hide();
	$('#poll').hide();
	$('#result').hide();
    $('#single').hide();
}

function resetGlobalVars() {
	updateCandidatesFlag = true;
	pollflag = true;
	pollCtr = 0;
}

function updateCandidatesInfo(response) {
    
	var candidateNum = response.data.length;

	for (var i = 0; i < candidateNum; i++) {
		$('#r_id'+ (i % 6)).html(response.data[i].id+"号");
	}
	for (var i = 0; i < candidateNum; i++) {
		$('#r_name'+ (i % 6)).html(response.data[i].name);
	}
}

function updateVotes(response) {
	console.log(response.data);
	var candidateNum = response.data.length;

	// result

	$('#result').show();
		
	for (var i = 0; i < candidateNum; i++) {
		$('#r_votes'+ (i % 6)).html(response.data[i].vote+" 票");
	}

	// update progress bar
	var maxVotes = response.data.maxVotes;
	for (var i = 0; i < candidateNum ; i++) {
		setProgressBar("#c_prog"+ (i % 6), response.data[i].votes / 50 * 100);
	}
}


function updateResults(response) {

	var candidateNum = response.data.length;
  
	// result
	
		// find max
		var max = -1;
		var index;
		for (var i = 0; i < candidateNum; i++) {
			var votes = response.data[i].vote;
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
			setHighlight(index % 6);
		}
		if (typeof index === "string") {
			var winners = index.split(",");
			for (var i in winners) {
				setHighlight(winners[i]);
			}
		}
		$('#result').show();
}

function setHighlight(number){
	$("#r_id" + number).addClass("highlight");
	$("#r_name" + number).addClass("highlight");
	$("#r_votes" + number).addClass("highlight");
	$("#c_prog"+ number).addClass("highlight");
}

$(document).ready(function(){
	setInterval(refresh,1000);
});

