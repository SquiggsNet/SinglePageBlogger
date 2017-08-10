$(document).ready(function() {
	var selectedId = $("#selectedId");
	var selectedSort = $("#selectedSort");
	var selectedOrder = $("#selectedOrder");
	selectedId.hide();
	
	selectedSort.hide();
	selectedOrder.hide();
	performAjaxAll();
	
	$("#new").click(function() {
		$("#titleInput").val("");
		$("#bodyInput").val("");
		selectedId.html("");
	});
	
	$("#submit").click(function() {
		var title = $("#titleInput")[0].value;
		var bodyInput = $("#bodyInput").val().split('\n');
		if (title  === '') {
        alert('Title is empty.');
        return false;
		}
		if (bodyInput[0]  === '') {
        alert("Post Body's first line is empty.");
        return false;
    }
		var body = "";
		$.each(bodyInput, function(index, item) {
			body += item;
			if (index+1 != bodyInput.length){
				body += "\\n";
			}
		});
		var date = new Date();
		var id = selectedId[0].innerHTML;
		var saveData = "";
		if(id != ""){
			saveData = '{'
				+'"title": "'+title+'",'
				+'"body": "'+body+'",'
				+'"date": "'+date+'",'
				+'"id": "'+id+'"}';
			performAjaxSaveEdit(saveData, id);
		}else{
			saveData = '{'
				+'"title": "'+title+'",'
				+'"body": "'+body+'",'
				+'"date": "'+date+'"}';
			performAjaxSaveNew(saveData);
		}		
	});
	
	$("#colTitle").click(function() {
		if(selectedSort[0].innerHTML != "title" || (selectedSort[0].innerHTML === "title" && selectedOrder[0].innerHTML === "DESC")){
			selectedSort.html("title");
			selectedOrder.html("ASC");
		}else{
			selectedOrder.html("DESC");
		}
		performAjaxAll();
	});
	$("th").hover(
		function() {
			$(this).animate({backgroundColor: "#428bca", color: "#f9f9f9"}, 'slow');
		}, function() {
			$(this).animate({backgroundColor:"#f9f9f9", color: "#428bca"},'slow');
	});
	
	$("#colBody").click(function() {
		if(selectedSort[0].innerHTML != "body" || (selectedSort[0].innerHTML === "body" && selectedOrder[0].innerHTML === "DESC")){
			selectedSort.html("body");
			selectedOrder.html("ASC");
		}else{
			selectedOrder.html("DESC");
		}
		performAjaxAll();
	});
	
	$("#colDate").click(function() {
		if(selectedSort[0].innerHTML != "date" || (selectedSort[0].innerHTML === "date" && selectedOrder[0].innerHTML === "DESC")){
			selectedSort.html("date");
			selectedOrder.html("ASC");
		}else{
			selectedOrder.html("DESC");
		}
		performAjaxAll();
	});
});

function performAjaxAll(){
	var sort = $("#selectedSort")[0].innerHTML;
	var order = $("#selectedOrder")[0].innerHTML;
	var getUrl = "";
	
	
	if (sort != "" && order != ""){
		// getUrl = "https://singlepageblogger.firebaseio.com/posts/.json?_sort="+sort+"&_order="+order;
		getUrl = 'https://singlepageblogger.firebaseio.com/posts/.json?orderBy="'+sort+'"';
	}else{
		getUrl = "https://singlepageblogger.firebaseio.com/posts/.json";
	}
	console.log(getUrl);
	$.ajax({
		url: getUrl,
		type: "GET",
		dataType:"json",
		headers: {"Access-Control-Allow-Headers": "x-requested-with"},
		success: function(result){
			displayAll(result);
		},
		error: function(err){
			$("#info").html("Error calling API");
			$( "#info" ).dialog();	
		}
	});
}

function performAjaxSaveNew(saveData){
	$.ajax({
		url: "https://singlepageblogger.firebaseio.com/posts/.json",
		type: "POST",
		data: saveData,
		success: function(result){
			$("#selectedId").html(result.id);
			performAjaxAll();
		},
		error: function(err){
			$("#info").html("Error saving post to API");
			$( "#info" ).dialog();	
		}
	});
}

function performAjaxSaveEdit(saveData, id){
	$.ajax({
		url: "https://singlepageblogger.firebaseio.com/posts/"+id+"/.json",
		type: "PUT",
		data: saveData,
		success: function(result){
			performAjaxAll();
		},
		error: function(err){
			$("#info").html("Error saving post to API");
			$( "#info" ).dialog();	
		}
	});
}

function performAjaxDelete(id){
	$.ajax({
		url: "https://singlepageblogger.firebaseio.com/posts/"+id+"/.json",
		type: "DELETE",
		success: function(result){
			performAjaxAll();
		},
		error: function(err){
			$("#info").html("Error deleting post");
			$( "#info" ).dialog();	
		}
	});
}

function performAjaxShowEdit(id){
	$.ajax({
		url: "https://singlepageblogger.firebaseio.com/posts/"+id+"/.json",
		type: "GET",
		success: function(result){
			displayEdits(result);
		},
		error: function(err){
			$("#info").html("Error calling Edit Information");
			$( "#info" ).dialog();	
		}
	});
}

function displayAll(data){
	var list = $("#list");
	var monthNames = ["January", "February", "March", "April", "May", "June",
	  "July", "August", "September", "October", "November", "December"
	];
	list.empty();

	if (data != null){
		for (var i=0; i<Object.keys(data).length; i++){
			var obj = Object.keys(data)[i];
			var date = new Date(data[obj].date);
			var postDate = monthNames[date.getMonth()] + " "+date.getDate() + " " +date.getFullYear();
			//postDate.append();
			list.append('<tr id="'+obj+'"><td>'+data[obj].title+'</td><td>'+data[obj].body+'</td>'
			+'<td>'+postDate+'</td><td>'
			+'<button type="button" class="btn btn-warning mRight edit" ><span class="glyphicon glyphicon-pencil"></span></button>'
			+'<button type="button" class="btn btn-danger delete" ><span class="glyphicon glyphicon-trash"></span></button></td>');
		}
	}
	
	$(".delete").click(function(){
		var id = this.parentNode.parentNode.id;
		$("#info").html("Are you sure you would like to delete this blog post? It cannot be retreived!");
		$("#info").dialog({
			resizable: false,
			height: "auto",
			width: 400,
			modal: true,
			buttons: {
				"Delete Post": function() {
					performAjaxDelete(id);
					$( this ).dialog( "close" );
				},
				Cancel: function() {
					$( this ).dialog( "close" );
				}
			}
		});
	});
	
	$(".edit").click(function(){
		var id = this.parentNode.parentNode.id;
		$("#selectedId").html(id);
		performAjaxShowEdit(id);
	});
	var selId = $("#selectedId")[0].innerHTML;
}

function displayEdits(data){
	var titleInput = $("#titleInput");
	var bodyInput = $("#bodyInput");
	var tite = data.title;
	titleInput.val("");
	bodyInput.val("");
	titleInput.val(data.title);
	bodyInput.val(data.body);
}

$(document).ajaxStart(function(){
    $("#loader").show();
});

$(document).ajaxStop(function(){
    $("#loader").hide();
	$("#list").slideDown();
});