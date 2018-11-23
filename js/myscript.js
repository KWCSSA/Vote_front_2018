var pollInterval;
var pollCtr = 0;

var updateCandidatesFlag = true;
var pollflag = true;
var lastGroup = 0;
var lastId = 0;

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
			hideAll();
			$('h1').html('歌手演唱中');
		} else if (response.state == "VOTING"){
			showResult(response.data.length);
			var s = response.timerRemain/1000;
			var t = '投票通道已开启';
			if (s <= 20) {
				s = '<span style="color:red">' + s + '</span>';
				t = '投票通道即将关闭';
			}
			$('h1').html(t + '<br>' + s);
			updateVotes(response);
			
		} else if (response.state == "VOTED"){
			showResult(response.data.length);
			$('h1').html('导师及大众评审投票时间');
			updateVotes(response);
		} else if (response.state === 'RESULT'){
			$("#result").show();
			$('h1').html('投票结果');
			updateVotes(response);
			updateResults(response);
		}
		
	}  else if (response.mode === 'poll' && pollflag) {
		pollflag = false;
		$('h1').html("抽奖");
		$('#voting').hide();
		$('#result2').hide();
		$('#result').hide();
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
		$("#poll").html(response.winner[2]+response.winner[3]+response.winner[4]+"XXX"
		+response.winner[8]+response.winner[9]+response.winner[10]+response.winner[11]);
	}
}

function setProgressBar(id, val) {
	$("#c_prog"+id).css('height', val + "%");
}	


// hide all sections, for resetting purpose
function hideAll() {
	$('#poll').hide();
	$('#result').hide();
	$('#result2').hide();
}

function resetGlobalVars() {
	updateCandidatesFlag = true;
	pollflag = true;
	pollCtr = 0;
}

function updateCandidatesInfo(response) {
	
	var candidates = null;
	candidates = response.data;
	var candidateNum = candidates.length;
	let offset = (candidateNum == 2) ? 4 : 0;
	for (var i = 0; i < candidateNum; i++) {
		$('#r_name'+ (i+offset)).html(candidates[i].name);
	}
}

function updateVotes(response) {
	
	var candidates = null;
	candidates = response.data;
	var candidateNum = candidates.length;
	let offset = (candidateNum == 2) ? 4 : 0;
	var pad = 1;
	// result
	var max = -1;
	for (var i = 0; i < candidateNum; i++) {
		max = Math.max(candidates[i].vote, max);
	}
	max += pad;
	
	
	for (var i = 0; i < candidateNum; i++) {
		$('#r_votes'+ (i+offset)).html((candidates[i].vote)+" 票");
	}
	
	for (var i = 0; i < candidateNum ; i++) {
		setProgressBar((i+offset), (candidates[i].vote + pad) * 90 / max + 10);
	}
} 


function updateResults(response) {
	
	var candidates = candidates = response.data;
	let offset = (candidates.length == 2) ? 4 : 0;

	let order = candidates.map((x,i)=>{return{votes: x.vote, ind: i}});
	order.sort((a,b) => b.votes-a.votes);
	let cutoff = order[0].votes;
	winners = order.filter(x => x.votes >= cutoff).map(x=> x.ind);

	for (var i in winners) {
		setHighlight(offset + winners[i]);
	}
	showResult(candidates.length);
}

function setHighlight(number){
	$("#r_id" + number).addClass("highlight");
	$("#r_name" + number).addClass("highlight");
	$("#r_votes" + number).addClass("highlight");
	$("#c_prog"+ number).addClass("highlight");
}

function showResult(candidateNum){
	if(candidateNum == 2){
		$('#result2').show();
		$('#result').hide();
	} else {
		$('#result').show();
		$('#result2').hide();
	}
}

$(document).ready(function(){
	hideAll();
	setInterval(refresh,1000);
});

