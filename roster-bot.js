var webshot = require('node-webshot');
var Jimp = require('jimp');
var Canvas = require('canvas');
var waterfall = require('async-waterfall');
const fs = require('fs')

// Import the discord.js library.
const Discord = require("discord.js")
// Create a new discord.js client.
const bot = new Discord.Client()

const DIG = require("discord-image-generation");

var ua = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0"

var options = {
	userAgent: ua
};


bot.on("ready", () => {
	console.log("bot is ready...");
})

function between(min, max) {
	return Math.floor(
		Math.random() * (max - min) + min
	)
}

function deleteFile(file) {
	try {
		if (fs.existsSync(file)) {
			fs.unlinkSync(file)
		}
	} catch (err) {
		console.error(err)
	}
}

// Listen to the message event
bot.on("message", async (message) => {
	if (message.content === "*update") {		

		if(!message.member.roles.cache.some(role => role.name === 'BWL-Recruiter'))
		{
			console.log("*update... => rejected")
			return
		}

		console.log("*update... => " +message.author.username+ "["+message.author.tag+"]@(" + message.guild.name+")")

		message.delete()
		var reply = message.reply("posting roster...")
			.then(msg => {
				msg.delete({
					timeout: 10000
				})
			})
			.catch( console.log("failed to reply...") )

		deleteFile('sheet.png')
		deleteFile('cropped_sheet.png')

		var url = 'https://docs.google.com/spreadsheets/d/1yEnxSwM1IKEnQjJaYM09U8rBDXNyFJ9HMaRL4qMCDZI'

		try {
			waterfall(
				[
					function(callback) {
						webshot(url, 'sheet.png', options, function(err, reply) {
							if (err) throw err;
							callback(null)
						}.bind({
							callback: callback
						}))
					},
					function(callback) {
						Jimp.read('sheet.png', function(err, sheet) {
							if (err) throw err;
							sheet
								.crop(48, 152, 416, 288)
								.write('cropped_sheet.png'); // save
							callback(null)
						}.bind({
							callback: callback
						}))
					},
					function(callback) {
						const attachment = new Discord.MessageAttachment('./cropped_sheet.png');
						message.channel.send(attachment)
						callback(null,"success")
					}.bind({
						message: message
					})
				],
				function(err, result) {
					if (err) throw err;
					console.log(result);
				}
			);
		} catch (err) {
			message.channel.send("Failed to post roster..." + err)
		}

	}
})

bot.login("Njg2MjU5MjY4NDM2ODg1NTIy.XmUmvw.HRIigv6xnyQ7ievnL6SaYsUoh54")