// carried over from PropSked website to ensure no inappropriate content 

// To send email, create a function in this emails folder (within a folder) that calls this function and send through all the needed data. 
// The actual email template will go into a folder in views/emails

const MAIL_GUN_KEY = process.env.MAIL_GUN_KEY
const MAIL_GUN_DOMAIN = process.env.MAIL_GUN_DOMAIN

const mailgun = require("mailgun-js");
const mg = mailgun({apiKey: MAIL_GUN_KEY, domain: MAIL_GUN_DOMAIN});
const ejs = require('ejs');
const path = require('path'); //get rid of this, just testing


module.exports = (senderEmail = process.env.MAIL_GUN_FROM, recepientEmail = 'chilly731@hotmail.com', emailSubject = 'PropSked', emailTemplateFile, emailEjsTemplateData) => {
    return new Promise((resolve, reject) => {
        try{
            ejs.renderFile(path.join(__dirname, '../', '/views/', emailTemplateFile), emailEjsTemplateData, (err, html) => { //emailEjsTemplateData for passing variables through to the ejs file
                if(err){
                    console.log(err)
                }
                const data = {
                    from: senderEmail,
                    to: 'chilly731@hotmail.com',
                    subject: emailSubject,
                    html: html
                };
                try{
                    mg.messages().send(data, async function (err) {
                        if(err) {
                            throw new Error ("Hm, an error occurred when trying to send an email: " + err)
                        }
                        console.log("Email sent to " + recepientEmail);

                        // resolving for the promise to complete
                        resolve()
                    });
                } catch(err) {
                    console.log(e)
                }
            })
            
        } catch(e) {
            console.log(e)
        }
    })
   
}

