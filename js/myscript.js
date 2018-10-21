var pollInterval;
var pollCtr = 0;

var updateCandidatesFlag = true;
var pollflag = true;
var lastGroup = 0;

function refresh(){
	$.ajax({
		type: 'GET' ,
		url: 'http://localhost:8080/result',
		dataType: 'json',
		success: function(response){
			update(response);
		}
	});
}


function update(response){
	console.log(response);

	if(response.type == 'NewGroup' && response.currentGroup != lastGroup){
		lastGroup = response.currentGroup;
		updateCandidatesFlag = true;
	}

	$('.highlight').removeClass('highlight');

	if (response.mode === 'vote' && response.state === "IDLE") {
		$('h1').html("滑大校园偶像-敬请期待");
		hideAll();
		resetGlobalVars();
	} else if (response.mode === 'vote') {
		$("#poll").hide();
	
		if (updateCandidatesFlag) {
			updateCandidatesFlag = false;
			updateCandidatesInfo(response);
		}

		if (response.state == "SINGLE"){
			$('#result').hide();
			$("#single").hide();
			$('h1').html('歌手演唱中');
		} else if (response.state == "VOTING"){
			
			if(response.type == 'NewGroup'){
				$('#result').hide();
				$("#single").show();
			} else {
				$('#result').show();
				$("#single").hide();
			}
			
			var s = response.timerRemain/1000;
			var t = '投票通道已开启';
			if (s <= 20) {
				s = '<span style="color:red">' + s + '</span>';
				t = '投票通道即将关闭';
			}
			$('h1').html(t + '<br>' + s);
			updateVotes(response);

		} else if (response.state == "VOTED"){
			if(response.type == 'NewGroup'){
				$('#result').hide();
				$("#single").show();
				$('h1').html('投票通道已关闭');
			} else {
				$('#result').show();
				$("#single").hide();
				$('h1').html('导师投票时间');
			}
			updateVotes(response);
		} else if (response.state === 'RESULT'){
			$('#single').hide();
			$("#result").show();
			$('h1').html('投票结果');
			updateVotes(response);
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
    $("#c_prog"+id).css('height', val + "%");
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
	
	var candidates = null;
	
	if(response.type == 'NewGroup'){
		candidates = response.data.filter(x=>x.group == response.currentGroup);
	} else {
		candidates = response.data;
	}

	var candidateNum = candidates.length;

	for (var i = 0; i < candidateNum; i++) {
		$('#r_id'+ i).html(candidates[i].id+"号");
	}
	for (var i = 0; i < candidateNum; i++) {
		$('#r_name'+ i).html(candidates[i].name);
	}
}

function updateVotes(response) {

	var candidates = null;
	if(response.type == 'NewGroup'){
		candidates = response.data.filter(x=>x.group == response.currentGroup);
	} else {
		candidates = response.data;
	}	
	var candidateNum = candidates.length;

	if(candidateNum > 6){
		$('#row2').show();
	} else {
		$('#row2').hide();
	}

	var pad = 1;
	// result
		
	for (var i = 0; i < candidateNum; i++) {
		$('#r_votes'+ i).html((candidates[i].vote)+" 票");
	}

	var max = -1;
	for (var i = 0; i < candidateNum; i++) {
		max = Math.max(candidates[i].vote, max);
	}
	max += pad;
	// update progress bar
	for (var i = 0; i < candidateNum ; i++) {
		setProgressBar(i, (candidates[i].vote + pad) * 90 / max + 10);
	}
}


function updateResults(response) {

	var candidates = null;
	
	if(response.type == 'NewGroup'){
		candidates = response.data.filter(x=>x.group == response.currentGroup);
	} else {
		candidates = response.data;
	}
	
	var candidateNum = candidates.length;
  
	// result
	
		// find max
		var max = -1;
		var index;
		for (var i = 0; i < candidateNum; i++) {
			var votes = candidates[i].vote;
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

