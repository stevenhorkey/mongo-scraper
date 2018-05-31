$.getJSON("/api/articles", function(data) {
  // For each one
  console.log(data)
  for (var i = 0; i < data.length; i++) {
    $("#articles").append("<div class='col-lg-3 col-md-6 mb-4'><div class='card' data-id="+data[i]._id+"><img class='card-img-top' src='"+data[i].image+"' alt=''><div class='card-body'><a href='"+data[i].link+"'><h4 class='card-title'>"+data[i].title+"</h4></a><p class='card-text'></p></div><div class='card-footer'><a data-id="+data[i]._id+" class='save-btn btn btn-primary'>Save Article</a></div></div></div>");
  }
});

$.getJSON("/api/saved", function(data) {
  // For each one
  console.log(data)
  for (var i = 0; i < data.length; i++) {
    $("#saved-articles").append("<div class='col-lg-3 col-md-6 mb-4'><div class='card' data-id="+data[i]._id+"><img class='card-img-top' src='"+data[i].image+"' alt=''><div class='card-body'><a href='"+data[i].link+"'><h4 class='card-title'>"+data[i].title+"</h4></a><p class='card-text'></p></div><div class='card-footer'><a data-id="+data[i]._id+" class='text-white del-save-btn btn btn-primary'>Delete From Saved</a></div></div></div>");
  }
});

$('#scrape-btn').on('click',function(){
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
    .then(function(data) {
      console.log(data);
    });
})

$('#articles').on("click",'.save-btn', function() {
  var thisId = $(this).closest('div.card').attr("data-id");
  var thisCard = $(this).closest('div.card');
  console.log(thisCard.find('h4').text());

  $.ajax({
    method: "PUT",
    url: "/api/saved/" + thisId,
  
  })
    .then(function(data) {
      console.log(data);
      location.reload();
    });

});

$('#saved-articles').on("click",'.del-save-btn', function() {
  console.log('working')
  var thisId = $(this).closest('div.card').attr("data-id");

  $.ajax({
    method: "PUT",
    url: "/api/unsaved/" + thisId,
  
  })
    .then(function(data) {
      console.log(data);
      location.reload();
    });

});

$('#saved-toggle').click(function(){
  $('#saved-articles').slideToggle();
})

$('#show-toggle').click(function(){
  $('#articles').slideToggle();
})