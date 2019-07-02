 
 //empty arrays, used for .on("click" fuctions to don't take into effect respective changes more than 2 times...
  var favButtonPushes=[]
  var favoriteGamesArray=[]
  var repetitiveFavoriteGamesPushes=[]

  //

  var user;
      

 //hiding games-saved-chart id when user has not login... 
 $("#saved-games-card").hide();

 //hiding login button...
 $("#logout").hide();

 //storing different elements used to pront ajax results into the DOM
  var favButton =$("<button>");
  var posterImage= $("<img>");
  var descriptionBox =$("<h4>");

 //api key for our giantbomb api...
 var apiKey = "bf4a00432b31ea4966819b748105a4d93da12821";
 
 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyC7DFF1nM3xl7dJH0siTbRiLUVrNMHGYuo",
    authDomain: "game-search-project.firebaseapp.com",
    databaseURL: "https://game-search-project.firebaseio.com",
    projectId: "game-search-project",
    storageBucket: "",
    messagingSenderId: "64495615699",
    appId: "1:64495615699:web:a6d486807f21c4d9"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  //getting firebase database stored in a variable...
  var dataRef = firebase.database();

  //firebase auth.. for when user logs in...
  var provider = new firebase.auth.GoogleAuthProvider();

//function firebase google authentication...
  function authGoogle(){
    //when signing in sucessfully...
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
                  console.log(token);
      // The signed-in user info.
      user = result.user;
      
      //clearing searches from the dom and the search val: to give the user a fresh start
      clearing();
      //showing saved games chart if they have logged in
      $("#saved-games-card").show();

      //clearing array
      favoriteGamesArray=[];
      
      //getting user's email
      var email =user.email
                  console.log(email);
      //for us to store database using email as property for the values 
      var finalEmail= email.split('.').join("");

      //hiding login tab & showing logout tab
      $("#login").hide();
      $("#logout").show();
      
    
      //function to use to call database stored values from each childSnapshot: 
      dataRef.ref(finalEmail +"/favoriteGames").on("child_added", function (childSnapshot) {
      //testing the values: 
                  console.log(childSnapshot.val());
      var divForFavoriteGames = $("<div class='favoriteGame'>");
      divForFavoriteGames.append(childSnapshot.val().name);
      $("#savedgames").append(divForFavoriteGames);
      //used to avoid pushing twice to firebase same game (refer to the dataRef.ref(....).push array)...
      favoriteGamesArray.push(childSnapshot.val().name);
                  console.log(favoriteGamesArray);
      });
      //debugger;
  
  
    //if they dont get to login successfully...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      //calling ajax function for when user has not loggin;
      //useThisKey();
     // debugger;
  
    });
  }

  useThisKey();

  //if they click on login tab...
  $("#login").on("click",function(){
    favoriteGamesArray=[]
    $("#savedgames").empty();
    authGoogle();
  });

  //if they click logout...
$("#logout").on("click",function(){
  //logout firebase signOut function....
  firebase.auth().signOut().then(function() {
    $("#savedgames").empty();
    $("#saved-games-card").hide();
    clearing();
    user=null;
    $("#logout").hide();
    $("#login").show();
  }).catch(function(error) {
    // An error happened.
  });
});


//if user has not login they this function will let them search for results...

//event delegator function for when the user clicks on saved games...
$("body").on("click",".favoriteGame",function(event){
  //to prevent the site from refreshing...
  event.preventDefault(event);
  console.log($(this).text());
  var gameName=$(this).text();
  
  //variables for user input and for url
  var queryURL = "https://www.giantbomb.com/api/games/?format=JSON&filter=name:"+ gameName +"&api_key="+ apiKey +"&limit=3&number_of_user_reviews=50";
  var queryURL = "https://www.giantbomb.com/api/games/?format=JSON&filter=name:" + gameName + "&api_key=" + apiKey + "&limit=1";

  // calling the 3 tabs (reviews, etc) (IVER)
  displayLinks();
  
  //ajax function... using jsonp to get results
  $.ajax({
      url: queryURL,
      dataType: "jsonp",
      jsonp: 'json_callback',
      data: {
          api_key: apiKey,
          format: 'jsonp',
      },

  }).then(function (response) {
      //after we get Jsonp
      //clear divs and clear input value.
      clearing();
                console.log(response);
      //lets print first value in array
      var data= response.results[0];
                console.log(data.name);

      //<img> is stored in global variable posterImage, <h4> is stored in global variable descriptionBox... 
      //give src and id attribute to posterImage...
      posterImage.attr("src", data.image.small_url);
      posterImage.attr("id","poster");
      //append it to #game-poster div
      $("#game-poster").append(posterImage);

      //lets work with the description div, and the descriptionBox element....
      descriptionBox.html(data.deck);
      $("#description").append(descriptionBox);

      //grab platform values from json result, platform values are in an array..
      var platformsArray = data.platforms;
      //to grab each of the array values we use for loop, to repeat each action with each value from platform array..
      for(var i=0;i<platformsArray.length;i++){
        var platformContainer=$("<p>");
        platformContainer.text(platformsArray[i].name);
        $("#platform").append(platformContainer);
                    console.log(platformsArray[i].name);
      }

  });

});
//....function ends here......


//function starts....if user decides not to log in, let them call results...
function useThisKey(){
  //giantbomb API front page changes.....
  localStorage.removeItem("gameDescription");//Erasing the Local Storage (IVER)
    
  //when they search for a game...
  $("#search-button").on("click", function (event) {
    //prevent page to refresh
    event.preventDefault(event);
    //variables for user input and for url
    var gameName=$("#game-search-box").val();
    var queryURL = "https://www.giantbomb.com/api/games/?format=JSON&filter=name:"+ gameName +"&api_key="+ apiKey +"&limit=3&number_of_user_reviews=50";
    var queryURL = "https://www.giantbomb.com/api/games/?format=JSON&filter=name:" + gameName + "&api_key=" + apiKey + "&limit=1";

    // calling the function to display buttons (review, developers, and price ) (IVER)
    displayLinks();

    //ajax function... using jsonp to get results because otherwise we dont
    $.ajax({
      url: queryURL,
      dataType: "jsonp",
      jsonp: 'json_callback',
      data: {
        api_key: apiKey,
        format: 'jsonp',
      },
    }).then(function (response) {
      //debugger;
      //after we get Jsonp
      //clear divs and clear input value.
        clearing();
              console.log(response);
      //lets print first value in array
      var data= response.results[0];
      var gameNamePrint =data.name
      repetitiveFavoriteGamesPushes=[];
      favButtonPushes=[];
      
        
              console.log(data.name);

      //img..(global variable)
      //give src and id attribute
      posterImage.attr("src", data.image.small_url);
      posterImage.attr("id","poster");
      posterImage.attr("data-name", gameNamePrint);
      //append it to #game-poster div
      $("#game-poster").append(posterImage);

      //work with the descriptionBox and append it
      descriptionBox.html(data.deck);
      $("#description").append(descriptionBox);

      //grab platform values from json result, platform values are in an array..
      var platformsArray = data.platforms;
      //to grab each of the array values we use for loop, to repeat each action with each value from platform array..
      for(var i=0;i<platformsArray.length;i++){
        var platformContainer=$("<p>");
        platformContainer.text(platformsArray[i].name);
        $("#platform").append(platformContainer);
                        console.log(platformsArray[i].name);
      }

      //favButton is a global variable,it is a button element, we are using it to save games to favorites:
      favButton.text("save to favorite games");
      $("#game-poster").append(favButton);


      // Saving into the Local Storage the Overview of the game to show it on the Review page. (IVER)
      localStorage.setItem("gameDescription",data.description);

      //passing on click function, dynamic button
      favButtonOnClick(user);   
    
        });
  });  
}

//...........function ends here.........

//...............function starts here: used to when user saves/tries to saved searched game...............
function favButtonOnClick(user){
  //when they click on favButton button: 
  favButton.on("click",function(event){
  event.preventDefault(event);
  //debugger;

                            console.log(favButtonPushes.length);
  //empty array, will be use for conditional below...
  var gameNamePrint = posterImage.attr("data-name");
  var pushes=favButtonPushes.length
  
  //if user is undefined and array is empty...
  if (user==null){
                                console.log(null);
    //not logged in - create div and attach it to the DOM to let user know they have not loggin
    var loginDiv=$("<div>");
    loginDiv.attr("id","login-div");
    $("#game-poster").prepend(loginDiv);
    $("#savedgames").empty();

    //print message to login
    //if the first attempt to save....
    if(pushes===0){
      loginDiv.text("*Please login to save games*");
      favButtonPushes.push("push");
    }
    //i second time....
    else if(pushes===1){
      loginDiv.text("You are not logged in, or have logged in unsuccesfully.");
      favButtonPushes.push("push");
    }
  }

  //else means they have looged in sucessfully, we will push to firebase database...
  else{
                    console.log(gameNamePrint);
                    console.log("it is detecting you are logged in!!!!!")
    //getting email adjusted to information firebase can accept and storing it in a variable....                 
    var email =user.email
    console.log(email);
    //for us to store database using email as property for the values 
    var finalEmail= email.split('.').join("");
  
    //if the favoriteGamesArray has the game in the list then we dont push to firebase - to control duplicates.... 
    if(favoriteGamesArray.includes(gameNamePrint)){
      //creating element to notice the user about the game they are trying to save
      var favGamesDivNotice=$("<div>");
      favGamesDivNotice.attr("id","fav-games-div");
                      console.log(repetitiveFavoriteGamesPushes.length)
      //if it is the first time tries to push this repetitive game
      if(repetitiveFavoriteGamesPushes.length===0){
        favGamesDivNotice.text("*This game is already in your favorite list*");
        $("#game-poster").prepend(favGamesDivNotice);
        repetitiveFavoriteGamesPushes.push("push");
      }
      //if it is the second tie trying to push it
      else if (repetitiveFavoriteGamesPushes.length===1){
        favGamesDivNotice.text("*please try with a different game*");
        $("#game-poster").prepend(favGamesDivNotice);
        repetitiveFavoriteGamesPushes.push("push");
      }
    }
    //else means is not in the list so we can push to firebase!!
    else{
      dataRef.ref(finalEmail +"/favoriteGames").push({
      name: gameNamePrint,
        // searchTerm: gameName,(we dont this one any more!!)
      });

    }


  } 
  });
}
//......function ends here.............

//array for the diferent button names
var buttonsArray = ["Reviews", "Prices", "Developers"]

//........function starts here...........
function displayLinks() { //Function to display Links "Reviews","Prices","Developers" after click on submit button (IVER)
//adjusted class becuase had to create another card with same classes; so gave unique id to the searching card (Ginna)
    $("#cardfooter").empty();
    for (var i = 0; i < buttonsArray.length; i++) {
      var href = buttonsArray[i].toLocaleLowerCase();
      var newLink = $("<a>");
      newLink.attr("id", "link");
      newLink.attr("href","../" + href + ".html");
      newLink.text(buttonsArray[i]);
      $("#cardfooter").append(newLink);
    }
}

//to clear divs and input value....
function clearing(){
  $("#game-search-box").val("");
  $("#game-poster").empty();
  $("#description").empty();
  $("#platform").empty();  
}





