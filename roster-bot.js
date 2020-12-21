var webshot = require('node-webshot');
var Jimp = require('jimp');
var Canvas = require('canvas');
var waterfall = require('async-waterfall');
const fs = require('fs')
const Discord = require("discord.js")

const bot = new Discord.Client()

var token = undefined

try {
  token = fs.readFileSync('./discord.token', 'utf8')
} catch (err) {
  console.log("failed to read token from bot.token")
}

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

		if (!message.member.roles.cache.some(role => role.name === 'Recruiter')) {
			console.log("*update... => rejected")
			return
		}

		console.log("*update... => " + message.author.username + "[" + message.author.tag + "]@(" + message.guild.name + ")")

		message.delete()
		var reply = message.reply("posting roster...")
			.then(msg => {
				msg.delete({
					timeout: 20000
				})
			})
			.catch()

		deleteFile('sheet.png')
		deleteFile('cropped_sheet.png')

		

		var url_bwl = 'https://docs.google.com/spreadsheets/d/1yEnxSwM1IKEnQjJaYM09U8rBDXNyFJ9HMaRL4qMCDZI'
		var url_aq = 'https://docs.google.com/spreadsheets/d/1frRIS1I9n7SVnvRLNbEH9fQSvdICSqMWnsY1dpwRIs8'
		var url = undefined

		var channel_name = message.channel.name;
		if(channel_name.toLowerCase().includes("bwl"))
		{
			url = url_bwl
		}
		else if(channel_name.toLowerCase().includes("aq"))
		{
			url = url_aq
		}

		if(url === undefined)
		{
			var reply = message.reply("unknown channel '"+channel_name+"', please write '*update' in a bwl or aq channel.")
			.then(msg => {
				msg.delete({
					timeout: 10000
				})
			})
			.catch()
			return
		}

		try {
			waterfall(
				[
					function(callback) {
						var ua = "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:84.0) Gecko/20100101 Firefox/84.0"
						var options = {
							userAgent: ua
						};
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
						callback(null, "success")
					}.bind({
						message: message
					})
				],
				function(err, result) {
					if (err) throw err;
				}
			);
		} catch (err) {
			message.channel.send("Failed to post roster..." + err)
		}

	}
})

try
{
	if(token !== undefined)
	{
		console.log("Using token from bot.token: "+ token)
		bot.login(token)	
	}
	else
	{
		if(process.env.DISCORD_TOKEN === undefined)
		{
			throw "DISCORD_TOKEN is undefined"
		}
		console.log("Using token from DISCORD_TOKEN: "+ process.env.DISCORD_TOKEN)
		bot.login()	
	}	
}
catch(err)
{
	console.log("Failed to start: " + err)
	process.exit(1)
}

