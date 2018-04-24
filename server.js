'use strict';

const express = require('express'),
    bodyParser = require('body-parser'),
    alexa = require('alexa-app'),
    app = express(),
    alexaApp = new alexa.app("trafalgar"),
    helper = require('./helper'),
    mailer = require('./mailer')

alexaApp.express({
    expressApp: app,
    checkCert: false
});

alexaApp.error = function (e, req, res) {
	console.log("Error in Alexa");
    console.log(e);
    console.log(req);
    throw e;
};
var locale = '';
var TourPackageIntentInvoked = false;
var destination ='';
var travelMonth = '';
var tripLengthStart = '';
var tripLengthEnd = '';
var priceRange = '';


//Simple card
alexaApp.card = function (current) {
    console.log('createCard: current=', current);
    var card = {
        type: 'Simple',
        title: 'Card'
    };
    
    card.content = content;
    return card;
};

//Standard card
alexaApp.standardCard = function () {
    var card = {
        type: 'Standard',
        title: 'Card',
        text: 'Sample Text \n Line2',
        image: {
            smallImageUrl: 'https://cdn3.iconfinder.com/data/icons/phones-set-2/512/27-512.png',
            largeImageUrl: 'https://cdn3.iconfinder.com/data/icons/phones-set-2/512/27-512.png'
        }
    };
    return card;
};

//Account linking card
alexaApp.accountLinkingCard = function () {
    var card = {
        type: "LinkAccount"
    }
    return card;
}


alexaApp.launch(function (request, response) {
    console.log('launch ' + JSON.stringify(request));
    console.log('Session Obj ' + JSON.stringify(request.getSession()));
    console.log('Session Obj is new ' + request.getSession().isNew());
    locale = request.data.request.locale;
    var say = ['<s>Hi!</s><s> Welcome to Trafalgar</s><s>What can I do for you</s>'];
    response.shouldEndSession(false);
    response.say(say.join('\n'));
    response.send();    
    
});

alexaApp.intent('TourPackageIntent', function (request, response) {
    resetAll();
    TourPackageIntentInvoked = true;
    var say = ['<s>Sure,<break strength=\"medium\" /> May I know where are you travelling to?</s>'];  
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('DestinationIntent', function (request, response) {
     destination = request.data.request.intent.slots.destination.value;
     var say = ['<s>Which is your month of travel?</s>'];
     console.log("destination is"+destination+"  Speech output: " + say);
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('TravelMonthIntent', function (request, response) {
    travelMonth = request.data.request.intent.slots.travelMonth.value;
     var say = ['<s>Please share length of trip</s>'];
     //say.push ('<s><break strength=\"medium\" /> 1 to 7 days</s>');
    // say.push('<s><break strength=\"medium\" /> 8 to 14 days</s>');
     //say.push('<s><break strength=\"medium\" /> more than 14 days</s>');
     console.log("travelMonth is"+travelMonth+"  Speech output: " + say);
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('TripLengthIntent', function (request, response) {
    tripLengthStart = request.data.request.intent.slots.tripLengthStart.value;
    tripLengthEnd = request.data.request.intent.slots.tripLengthEnd.value;    
    var say=['<s>Please share per person price range for package for the trip in US dollars?</s>'];        
    console.log("tripLength is "+tripLengthStart+ "to"+tripLengthEnd+".and   Speech output: " + say);        
        response.shouldEndSession(false);
        response.say(say.join('\n'));
});

alexaApp.intent('PriceRangeIntent', function (request, response) {
    priceRange = request.data.request.intent.slots.priceRange.value;
    var say = ['<s>There are 12 packages available in that price range.</s><s>Shall I send the details to your email ID?</s>'];        
    console.log("priceRange is"+priceRange+"  Speech output: " + say);     
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('EmailConfirmIntent', function (request, response) {
    return mailer.mailPackageDetails().then((result)=>{
       var say = ["<s>Email sent</s><s>Glad to be of help!</s>"];
       console.log('after call',say);
        response.shouldEndSession(true);
        response.say(say.join('\n'));

    }).catch((err)=>{
        say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
        response.shouldEndSession(true);
        response.say(say.join('\n'));				
})      
});

alexaApp.intent('EmailCancelIntent', function (request, response) {
    var say = ['<s>okay<break strength=\"medium\" />you can get them later</s>'];        
    console.log("priceRange is"+priceRange+"  Speech output: " + say);     
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('rentalConfirmIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say = ["<s> As per your policy, you are eligible for 30 days rental car service not exceeding $35 a day.</s>"];
    say.push('<s> Can you let me know the start date of the rental car service?</s>');
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('rentalCancelIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Okay,But you can book a rental car later!</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
});

alexaApp.intent('rentalDetailsIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =[];
    console.log(request.data.request.intent.slots);
    if (request.data.request.intent.slots.startDate.value && rentalStartDate =='' ){
        rentalStartDate = request.data.request.intent.slots.startDate.value;
        console.log(rentalStartDate);
        say =["<s> Can you tell me for how many days you would require the rental car service?</s>"];
    }
    if(rentalStartDate==''){
        say =["<s> Can you let me know the start date of the rental car service?</s>"];
    }
    if(request.data.request.intent.slots.days.value && rentalDays ==''){
        rentalDays = request.data.request.intent.slots.days.value;
        return helper.getRentalConfirmation(claimId,rentalStartDate,rentalDays).then((result)=>{            
            say = result;
            console.log('after call',say);
            response.shouldEndSession(false);
            response.say(say.join('\n'));         
        }).catch((err)=>{
            say = ["<s> Something went wrong while processing your request.</s><s>Please try again</s>"];
            response.shouldEndSession(true);
            response.say(say.join('\n'));				
        })
    }
    if(rentalDays==''){
        say =["<s> Can you tell me for how many days you would require the rental car service?</s>"];
    }
   // var say =["<s> Happy to help you!</s>"];
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

alexaApp.intent('GermanWelcomeIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Willkommen beim Politikassistenten.</s><s>Was kann ich für Dich tun</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
});

alexaApp.intent('thankIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say =["<s> Happy to help you!</s>"];
    response.shouldEndSession(true);
    response.say(say.join('\n'));
    resetAll();
});


if (process.argv.length > 2) {
    var arg = process.argv[2];
    if (arg === '-s' || arg === '--schema') {
        console.log(alexaApp.schema());
    }
    if (arg === '-u' || arg === '--utterances') {
        console.log(alexaApp.utterances());
    }
}

function getRepairPaymentDetailsMessage(callback){
    say.push('<s>The amount of $'+result.totalPayments.amount+' is credited to your bank account number <break strength=\"medium\" /> <say-as interpret-as="spell-out">'+result.bankAccountNumber+'</say-as> </s>');
    say.push('<s>on '+result.paymentDate+'.</s>');
    callback (say);
}

/*function getRentalCarStatus(claimId,callback){
    var say = ["<s> The Rental car has not been booked yet as the option was not selected when the claim was created.</s>"];
    say.push('<s> <break strength=\"medium\" /> Do you want to book one? </s>');
    callback (say);
}

function getRentalConfirmation(startDate,callback){
    console.log('In function'+startDate);
    var say = ["<s> Give me a moment and I shall revert with booking details.<break time='2s'/>  </s>"];
    say.push('<s> The car has been booked with the Rental agency <break strength=\"medium\" /> “Enterprise” and the reservation number is <say-as interpret-as=\"spell-out\">AB0963829</say-as>. </s>');
    say.push('<s> The car will be delivered on<break strength=\"medium\" />');
    say.push('April 5, 9AM.</s>');    
    callback (say);
}*/

function resetAll(){
    locale = '';
    TourPackageIntentInvoked = false;
    destination ='';
    travelMonth = '';
    tripLengthStart = '';
    tripLengthEnd = '';
    priceRange = ''
}

alexaApp.intent('repairPaymentDetailsIntent', function (request, response) {
    var all = JSON.parse(request.session('all') || '{}');
    var say = [];
    console.log(claimPaymentDetails);
    console.log(repairPaymentIntentCalled);
    if(claimIdPresent && (Object.keys(claimPaymentDetails).length !== 0) && repairPaymentIntentCalled && 
        (claimPaymentDetails.paymentStatus === "Issued" || claimPaymentDetails.paymentStatus === "Cleared")) {
        say = getRepairPaymentDetailsMessage();
    } else {
        var say = ["<s>Since the payment status is "+claimPaymentDetails.paymentStatus+", we are unavailable to provide the details. Please try something else.</s>"];
    }
    response.shouldEndSession(false);
    response.say(say.join('\n'));
});

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});