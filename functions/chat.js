//var config = require('../config.js');
try{
    var config = process.cwd()+'/config.js';
    config = require(config);
}catch (error){
    console.error('ERROR -> Unable to load config file.');
    process.exit(1);
}

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

// A lightweight JavaScript date library for parsing, validating, manipulating, and formatting dates.
const moment = require('moment-timezone');

const { EmbedBuilder } = require('discord.js');

const Big = require('big.js'); // https://github.com/MikeMcl/big.js -> http://mikemcl.github.io/big.js/

/* ------------------------------------------------------------------------------ */
// // // // // // // // // // // // // // // // // // // // // // // // // // // //
/* ------------------------------------------------------------------------------ */

module.exports = {

    /* ------------------------------------------------------------------------------ */
    // Create reply message
    /* ------------------------------------------------------------------------------ */
    //   msg.channel.send(chat.chat_build_reply('embed',userName,messageType,config.colors.special,['Test Author Name',config.wallet.thumbnailIcon,'https://google.de'],'Title',[['Testfield1','Testfield1 Value',true],['Testfield2','Testfield2 Value',true]],'This is a test description.',['Test Footer',config.wallet.thumbnailIcon],config.wallet.thumbnailIcon,'https://media.wired.com/photos/5ada3a2c1e66870735eada27/master/pass/DragonPasswordFINAL.jpg',1));
    chat_build_reply: function(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp){
        if(replyType == 'normal'){
            if(senderMessageType == 'dm' || !replyUsername){
                return replyDescription;
            }else{
                return  replyDescription + ' ' + replyUsername;
            }
        }
        if(replyType == 'embed' || 'private'){
            var embed = new EmbedBuilder();
            // Set embed color
            if(replyEmbedColor){
                // Convert color to proper format for Discord.js v14
                if(typeof replyEmbedColor === 'string' && replyEmbedColor.startsWith('0x')){
                    embed.setColor(parseInt(replyEmbedColor, 16));
                } else if(typeof replyEmbedColor === 'number') {
                    embed.setColor(replyEmbedColor);
                } else {
                    embed.setColor(parseInt(replyEmbedColor, 16));
                }
            }else{
                embed.setColor(config.colors.normal);
            }
            // Set reply autor
            if(replyAuthor){
                var replyAuthorName = '';
                var replyAuthorIcon = '';
                var replyAuthorLink = '';
                if(replyAuthor[0])
                    replyAuthorName = replyAuthor[0];
                if(replyAuthor[1])
                replyAuthorIcon = replyAuthor[1];
                if(replyAuthor[2])
                    replyAuthorLink = replyAuthor[2];
                embed.setAuthor({name: replyAuthorName, iconURL: replyAuthorIcon, url: replyAuthorLink});
            }
            // Set Title
            if(replyTitle){
                embed.setTitle(replyTitle.toUpperCase());
            }
            // This could be added to be able to set a link for the title
            // embed.setURL('http://google.de');
             // Set description
            if(replyDescription){
                //console.log(senderMessageType+' '+replyUsername+' '+typeof(replyUsername));
                // Check if request was not private or add username disabled
                if(senderMessageType === 'DM' || !replyUsername){
                    embed.setDescription(replyDescription);
                }else{
                    embed.setDescription(replyDescription + ' ' + replyUsername);
                }
            }
            // Set reply fields
            for (var i = 0 ; i < replyFields.length ; ++i){
                if(replyFields[i][0] === 0 && replyFields[i][1] === 0){
                    embed.addFields({name: "** **", value: "** **", inline: false});
                }else{
                    embed.addFields({name: replyFields[i][0], value: replyFields[i][1], inline: replyFields[i][2]});
                }
                
            }
            // Set reply footer
            if(replyFooter){
                var replyFooterText = '';
                var replyFooterIcon = '';
                if(replyFooter[0])
                    replyFooterText = replyFooter[0];
                if(replyFooter[1])
                    replyFooterIcon = replyFooter[1];
                embed.setFooter({text: replyFooterText, iconURL: replyFooterIcon});
            }
            // Set thumbnail
            if(replyThumbnail){
                embed.setThumbnail(replyThumbnail);
            }   
            // Set image
            if(replyImage){
                embed.setImage(replyImage);
            }
            // Set timestamp
            if(replyTimestamp){
                embed.setTimestamp();
            }
            // all done and return embed
            return embed;
        }
    },

    /* ------------------------------------------------------------------------------ */
    // Build chat reply
    /* ------------------------------------------------------------------------------ */

    chat_reply: function(msg,replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp){
        // Handle cases where msg is null/undefined (e.g., cron jobs)
        if(!msg){
            console.log('Chat reply called without message object (likely from cron job)');
            return Promise.resolve();
        }
        
        if(replyType == 'private'){
            if(!msg.author){
                console.log('Cannot send private message - no author available');
                return Promise.resolve();
            }
            return msg.author.send({embeds: [this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp)]});
        }else if(replyType == 'pool'){
            var poolChannel = globalClient.channels.cache.get(config.bot.stakePoolChannelID);
            if(!poolChannel){
                console.log('Pool channel not found or not accessible');
                return Promise.resolve();
            }
            return poolChannel.send({embeds: [this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp)]});
        }else{
            if(!msg.channel){
                console.log('Cannot send message - no channel available');
                return Promise.resolve();
            }
            const embed = this.chat_build_reply(replyType,replyUsername,senderMessageType,replyEmbedColor,replyAuthor,replyTitle,replyFields,replyDescription,replyFooter,replyThumbnail,replyImage,replyTimestamp);
            if(embed && typeof embed === 'object'){
                return msg.channel.send({embeds: [embed]});
            } else {
                return msg.channel.send(embed);
            }
        }
    }
    
};