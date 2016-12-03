var tobi = {
    settings: {
        autowoot: true,
        songstats: true,
        commands: true,
        dcs: true,
        greetings: true,
        staffgreetings: true, //Add room theme set.
        announcements: false,
        anninterval: 5400000, //1 hour and 30 minutes.
        annmessage: "", //A message that you want to bot to annouce in the chat every x amount of minutes.
        afkremove: true,
        lottery: true,
        glitchskip: false,
    },
    misc: {
        deleteq: []
    },
    user: {
        id: API.getUser().id,
        username: API.getUser().username
    },
    stats: {
        ups: 0,
        downs: 0,
        grabs: 0,
        dj: $('.imgEl img').attr('alt'),
        song: $(".currentSong").html(),
        lastdel: undefined
    },
    version: "2.021",
    getStorage: function() {
        if (localStorage.tobisettings == undefined) { //Fetching all settings!
            localStorage.setItem("tobisettings", JSON.stringify(tobi.settings));
        } else {
            var retrievedData = localStorage.getItem("tobisettings");
            var list = JSON.parse(retrievedData);
            tobi.settings = list;
        }
        if (localStorage.tobiuserinfo == undefined) { //Fetching user info!
            localStorage.setItem("tobiuserinfo", JSON.stringify(tobi.userinfo));
        } else {
            var retrievedData = localStorage.getItem("tobiuserinfo");
            var list = JSON.parse(retrievedData);
            tobi.userinfo = list;
        }
    },
    updateStorage: function() {
        localStorage.setItem("tobisettings", JSON.stringify(tobi.settings));
        localStorage.setItem("tobiuserinfo", JSON.stringify(tobi.userinfo));
    },
    startup: function() { //Function to bring Tobi to life!!!
        tobi.getStorage();
        tobi.fetchUsers();
        this.proxy = {
            userJoin: $.proxy(this.userJoin, this),
            userLeave: $.proxy(this.userLeave, this),
            newSong: $.proxy(this.newSong, this),
            eventchat: $.proxy(this.eventchat, this),
        };
        API.on(API.USER_JOIN, this.proxy.userJoin);
        API.on(API.ADVANCE, this.proxy.newSong);
        API.on(API.USER_LEAVE, this.proxy.userLeave);
        if (tobi.settings.autowoot == true) $('#woot').click();
        API.on(API.CHAT, this.proxy.eventchat);
        if (tobi.settings.glitchskip == true) tobi.glitchskip();
        tobi.chat('YEEEH HOMIES!!! I BE ONLINE!!! [BOT ONLINE v. ' + tobi.version + ']');
        console.warn("Slave Bot is online!");
    },
    userinfo: [],
    chat: function(msg) {
        API.sendChat(msg);
    },
    fetchUsers: function() {
        var a = [];
        for (var i = 0; i < tobi.userinfo.length; i++) {
            a.push(tobi.userinfo[i].id);
        }
        for (var i = 0; i < API.getUsers().length; i++) {
            if (a.indexOf(API.getUsers()[i].id) == -1) tobi.addUser(API.getUsers()[i].username, API.getUsers()[i].id, API.getUsers()[i].role);
        }
    },
    newSong: function(obj) {
        if (tobi.settings.songstats == true) {
            if (tobi.misc.deleteq.length > 0) {
                for (var i = 0; i < tobi.misc.deleteq.length; i++) {
                    tobi.del(tobi.misc.deleteq[i]);
                    tobi.misc.deleteq = [];
                }
            }
            setTimeout(function() {
                tobi.chat(':information_source: Last Song: ' + obj.lastPlay.dj.username + ' played ' + obj.lastPlay.media.title + ' by ' + obj.lastPlay.media.author + ' | :green_heart:: ' + obj.lastPlay.score.positive + ' | :purple_heart::' +
                    obj.lastPlay.score.grabs + ' | :heart::' + obj.lastPlay.score.negative + ' |');
            }, 1500);
        }
        if (tobi.settings.autowoot == true) $("#woot").click();
    },
    eventchat: function(e) {
        return tobi.commandcheck(e.un, e.message, e.uid, e.cid, API.getUser(e.uid).role);
    },
    commandcheck: function(user, message, id, cid, rank) { //Dispatches commands. Command list below.
        if (tobi.settings.commands == true) {
            if (id !== undefined) {
                if (user !== tobi.user.username) {
                    if (message.substring(0, 1) == "@" || message.substring(0, 1) == "!" || message.substring(0, 1) == ".") {
                        if (tobi.commands[message.substring(1, message.length).split(" ")[0].toLowerCase()] !== undefined) {
                            tobi.del(cid);
                            tobi.commands[message.substring(1, message.length).split(" ")[0].toLowerCase()].f(user, message, id, cid, rank);
                        } else if (message.substring(0, 10) == "@Slave Bot") {
                            tobi.commands["Slave_Bot"].f(user, message, id, cid, rank);
                        }
                    }
                } else {
                    if (message.indexOf("Last Song") != -1) tobi.misc.deleteq.push(cid);
                }
            }
        }
    },
    commands: { // a = username, b = message, c = user id, d = chat id, e = rank.
        fap: {
            f: function(a, b, c, d, e) {
                var r = Math.floor(Math.random() * tobi.arrStorage.fap.length);
                tobi.chat("[!fap] @" + a + tobi.arrStorage.fap[r]);
            }
        },
        random: {
            f: function(a, b, c, d, e) {
                var r = Math.floor(Math.random() * tobi.arrStorage.random.length);
                tobi.chat("[.random] @" + a + " " + tobi.arrStorage.random[r]);
            }
        },
        restart: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    tobi.chat("[!restart] 'IGHT MAN!! IMMA RICKEH RICKEN RESTART REAL QUICK!");
                    location.reload();
                }
            }
        },
        skip: {
            f: function(a, b, c, d, e) {
                if (tobi.findUser(c).rank >= 2) {
                    tobi.chat("[!skip] MAH HOMIEE " + a + " MADE ME SKIP DIS SAWG!!");
                    API.moderateForceSkip();
                }
            }
        },
        link: {
            f: function(a, b, c, d, e) {
                var gotolink = "";
                if (API.getMedia().format == 1) {
                    gotolink = "http://y2u.be/" + API.getMedia().cid;
                } else {
                    SC.get("/tracks/" + API.getMedia().cid, function(e) {
                        gotolink = e.permalink_url;
                    })
                }
                tobi.chat("[!link] HERE'S DA LINK TO THE CURRENT SAWNG HOMIE!!! " + gotolink);
            }
        },
        move: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    var id, position;
                    id = tobi.usernamelookup(b.substring(b.indexOf("@") + 1).trim()).id;
                    position = parseInt(b.substring(b.indexOf(" ") + 1, b.indexOf("@") - 1));
                    setTimeout(function() {
                        tobi.move(id, position);
                    }, 1000);
                }
            }
        },
        glitchskip: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    if (b.split(" ")[1] == "on") {
                        tobi.settings.glitchskip = true;
                        tobi.glitchskip();
                    } else if (b.split(" ")[1] == "off") {
                        tobi.settings.glitchskip = false;
                    }
                    tobi.chat("[!glitchskip] @" + a + " TURNED USER GLITCHSKIP " + b.split(" ")[1].toUpperCase() + "!!");
                    return tobi.updateStorage();
                }
            }
        },
        rules: {
            f: function(a, b, c, d, e) {
                tobi.chat("[!rules] AYOO REALLL TALK!!! HERE'S DAA RULES LISS! LOOK AT THISS SHIT!!! http://goo.gl/j22pRm");
            }
        },
        commands: {
            f: function(a, b, c, d, e) {
                tobi.chat("[!commands] @" + a + " HERE YOU GO HOMIE!!! HERES MY COMMAND LISS! CLICK DIS SHIT!! https://goo.gl/cnLcxd")
            }
        },
        lick: {
            f: function(a, b, c, d, e) {
                tobi.chat("[!lick] @" + a + " GET THE FUK OFF ME YOU CREEPY ASS NIGGA!!!")
            }
        },
        nipples: {
            f: function(a, b, c, d, e) {
                var r = Math.floor(Math.random() * tobi.arrStorage.nipples.length);
                tobi.chat("[!nipples] @" + a + " " + tobi.arrStorage.nipples[r])
            }
        },
        op: {
            f: function(a, b, c, d, e) {
                tobi.chat("[.op] @" + a + " NO PRAHBLEM!! HERES DUH OVUHPLAYED SAWNG LISS! https://goo.gl/kI0MgY")
            }
        },
        whip: {
            f: function(a, b, c, d, e) {
                tobi.chat("[!whip] @" + a + " *thwack*")
            }
        },
        slots: {
            f: function(a, b, c, d, e) {
                var sects = [':poultry_leg:', ':deciduous_tree:', ':watermelon:'],
                    nums = [],
                    check = new Date().getTime() - tobi.findUser(c).lastslot,
                    msg = "[!slots] [" + a + "] [";
 
                if (Math.round(check / 60 / 1000) > 15 || tobi.findUser(c).lastslot == NaN) {
                    for (var i = 0; i < 3; i++) {
                        var r = Math.floor(Math.random() * sects.length);
                        msg += sects[r] + '|';
                        nums.push(r);
                    }
                    msg += ']';
                    if (nums[0] == nums[1] && nums[1] == nums[2]) {
                        msg += "- AWWW FUK MAN!!! YOU HIT THE JACKPOT!!! MOVIN YO SEXY ASS UP!!!";
                        msg = ":white_check_mark: " + msg;
                        if (API.getWaitListPosition(c) + 1 >= 1) tobi.move(c, 1);
                    } else {
                        msg += "- YOU LOST NIGGA! NEXT PULL AVAILABLE IN 15 MINUTES!!";
                        msg = ":negative_squared_cross_mark: " + msg;
                    }
                    tobi.findUser(c).lastslot = new Date().getTime();
                    tobi.chat(msg);
                } else {
                    tobi.chat(':negative_squared_cross_mark: [!slots][' + a + '] TRY AGAIN IN ' + String(15 - Math.round(check / 60 / 1000)) + "min!", 3500);
                }
            }
        },
        Slave_Bot: {
            f: function(a, b, c, d, e) {
                if (tobi.arrStorage.trigger_words.indexOf(b.substring(10).trim()) !== -1) { //Insult.
                    var r = Math.floor(Math.random() * tobi.arrStorage.angry_responses.length);
                    tobi.chat("@" + a + " " + tobi.arrStorage.angry_responses[r]);
                } else if (tobi.arrStorage.ptrigger_words.indexOf(b.substring(10).trim()) != -1) {
                    var r = Math.floor(Math.random() * tobi.arrStorage.lovely_responses.length);
                    tobi.chat("@" + a + " " + tobi.arrStorage.lovely_responses[r]);
                } else if (b.trim() == "@Slave Bot") {
                    tobi.chat("@" + a + " THE FUCK YOU WANT NIGGA?! SPEAK UP!");
                }
            }
        },
        version: {
            f: function(a, b, c, d, e) {
                tobi.chat("@" + a + " I AM CURRENTLY AT VERSION " + tobi.version + "!");
            }
        },
        greetings: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    if (b.split(" ")[1] == "on") {
                        tobi.settings.greetings = true;
                    } else if (b.split(" ")[1] == "off") {
                        tobi.settings.greetings = false;
                    }
                    tobi.chat("[!greetings] @" + a + " TURNED USER GREETINGS " + b.split(" ")[1].toUpperCase() + "!!");
                    return tobi.updateStorage();
                }
            }
        },
        songstats: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    if (b.split(" ")[1] == "on") {
                        tobi.settings.songstats = true;
                    } else if (b.split(" ")[1] == "off") {
                        tobi.settings.songstats = false;
                    }
                    tobi.chat("[!songstats] @" + a + " TURNED SONG STATS " + b.split(" ")[1].toUpperCase() + "!!");
                    return tobi.updateStorage();
                }
            }
        },
        cmds: {
            f: function(a, b, c, d, e) {
                if (e >= 2) {
                    if (b.split(" ")[1] == "on") {
                        tobi.settings.commands = true;
                    } else if (b.split(" ")[1] == "off") {
                        tobi.settings.commands = false;
                    }
                    tobi.chat("[!cmds] @" + a + " TURNED USER COMMANDS " + b.split(" ")[1].toUpperCase() + "!!");
                    return tobi.updateStorage();
                }
            }
        }
    },
    del: function(e) {
        API.moderateDeleteChat(e);
    },
    addUser: function(username, id, rank) { //Adds specified users to the universal userlist.
        var info = {
            username: username,
            pp: 0,
            rank: rank,
            friend: false,
            joined: new Date().toDateString() + " at " + new Date().toLocaleTimeString(),
            inRoom: true,
            id: id,
            lastslot: 0,
            position: -1,
            slots: 0,
            nickname: undefined,
            dj: 0,
            dc: []
        };
        tobi.userinfo.push(info);
        return tobi.updateStorage();
    },
    findUser: function(id) {
        for (var i = 0; i < tobi.userinfo.length; i++) {
            if (tobi.userinfo[i].id == id) {
                return tobi.userinfo[i];
            }
        }
    },
    usernamelookup: function(user) {
        for (var i = 0; i < API.getUsers().length; i++) {
            if (String(user) == API.getUsers()[i].username) {
                return API.getUsers()[i]; //returning all user information.
            }
        }
    },
    userJoin: function(user) {
        if (tobi.stats.currentusers.indexOf(user.username) == -1) { //User doesn't exist on "current users in room list".
            tobi.stats.currentusers.push(user.username);
            console.warn(user.username + " joined the room!");
            if (tobi.settings.greetings == true) {
                var r = Math.floor(Math.random() * tobi.arrStorage.greetings.length);
                tobi.chat(tobi.arrStorage.greetings[r] + " @" + user.username);
            }
            if (tobi.findUser(user.id) == undefined) { //If the user is not on the archived user list.
                tobi.addUser(user.username, user.id, user.role);
            }
        }
    },
    userLeave: function(e) {
        tobi.updateStorage();
        console.warn(e.username + " left the room! (" + new Date().toLocaleTimeString() + ")");
        tobi.findUser(e.id).inRoom = false;
        tobi.findUser(e.id).position = -1;
    },
    move: function(id, spot) {
        var waiting = [];
        for (var i = 0; i < API.getWaitList().length; i++) {
            if (API.getWaitList()[i].id == id) {
                waiting.push(1);
            }
        }
        if (waiting.length > 0) {
            return API.moderateMoveDJ(id, spot);
        } else {
            API.moderateAddDJ(id);
            setTimeout(function() {
                return API.moderateMoveDJ(id, spot);
            }, 1000);
        }
    },
    glitchskip: function() {
        if (tobi.settings.glitchskip == true) {
            var gsi = setInterval(function() {
                if (document.getElementById("dialog-restricted-media")) {
                    setTimeout(function() {
                        API.moderateForceSkip();
                        tobi.chat("AYOOO!! DIS TRACK BE BROKEN! I GOT THIS! HOMIE!");
                    }, 3500);
                }
            }, 10000);
        }
    },
    announce: function() {
        setInterval(function() {
            if (tobi.settings.announcements == true) {
                tobi.chat(tobi.settings.annmessage);
            }
        }, tobi.settings.anninterval);
    },
    arrStorage: {
        random: [
            "http://goo.gl/aOnG2a", "http://i.imgur.com/LnzniB1.gif",
            "http://i.imgur.com/7uN6t0w.jpg", 'http://i.imgur.com/lP7SDVu.gif?1', "http://goo.gl/YSMGGJ", "http://goo.gl/898ZtL", "http://goo.gl/4bhjiy", "http://goo.gl/KuDrLD",
            "http://goo.gl/MQJAkz", "http://goo.gl/0MqP0N", "http://goo.gl/8OhNKu",
            "http://neave.com/strobe/", "http://shiiiit.com/", "http://goo.gl/9UkjyQ", "http://goo.gl/E4fBs1", "http://goo.gl/x6kKm3", "http://goo.gl/6qlBZX", "http://scolez.net/insult/", "http://goo.gl/pK6y1h",
            "http://goo.gl/toUouF", "http://goo.gl/BekTz2", "http://goo.gl/czSdHG", "http://astretchyhand.com/", "http://goo.gl/8Nf9vI", "http://goo.gl/24Hdkj", "http://goo.gl/X16OHf",
            "http://goo.gl/rRzUzf", "http://goo.gl/5Mzsgr", "http://findtheinvisiblecow.com/",
            "http://shavethemtitties.com/", "http://goo.gl/JBVypB", "http://goo.gl/GHSgFV", "http://i.imgur.com/2KpnarN.jpg", "http://bit.ly/K0HUdi", "http://bit.ly/1igcgab", "http://twinbeard.com/frog-fractions",
            "http://goo.gl/ZLjJT", "http://twerkball.co.uk/", "http://andrius.esu.lt/10/go2.htm", "http://goo.gl/T2OqDt", "http://goo.gl/GNe7Zf", "http://goo.gl/ddvCSw", "http://goo.gl/mVSw9e", "http://goo.gl/eTzu7R", "http://goo.gl/LsXrtr", "http://goo.gl/O5OiXN",
            "http://goo.gl/jHfxpu", "http://goo.gl/2gfR16", "http://goo.gl/wpPQtL", "http://goo.gl/Zd1J5k", "http://goo.gl/PeDxj9", "http://goo.gl/VuAcU8", "http://goo.gl/FCbR1A", "http://goo.gl/PFs4hg", "http://goo.gl/pWmUiJ",
            "http://goo.gl/5mFs5C", "http://goo.gl/cVzCqb", "http://goo.gl/fcOUnx", "http://goo.gl/PJcG7e", "http://goo.gl/Qeu7rw", "http://goo.gl/S8RMZi", "http://goo.gl/PhKdu4", "http://goo.gl/xmZhke", "https://goo.gl/z12s5c", "http://i.imgur.com/7LGPZ0r.gifv",
            "https://goo.gl/RkxntN"
        ],
        fap: [
            " please stop banging yourself!", ", please stop bitch-slapping your stomper!", ", please stop frightening the blue veined custard chucker!",
            ", please stop putting Mr. Kleenex's kids through college!", ", please stop busting the left nut instead of the right one.",
            ", pleases stop shakin' the bacon!", ", please stop shooting puddy at the moon!",
            ", please stop chafing the squirtgun!", ", please stop beating the red-headed cock-eyed woodpecker!", ", please stop doing the Johnson and ball dance!",
            ", quit playing with Burt Reynold's mustache!",
            ", quit reaming the one eyed semen demon!", ", quit wankin' and spankin'!", ", quit whipping up some baby batter!",
            "quit fumbling your frank!"
        ],
        insults: [
            "creepy nigga", "asshole", "bitch", "piece of shit", "turd gargler", "nigga", "mutha fucka", "fuck face"
        ],
        trigger_words: [
            "fuck you", "asshole", "motherfucker", "mother fucker", "nigger", "cunt", "bitch", "fag", "shut the fuck up", "stfu", "faggot", "dick", "jerk", "eat my ass", "fuck u", "fuk u", "fuck off", "mutha fucka",
            "suck my dick", "suck my cock", "suck my wiener", "suck my clit", "suck my cunt"
        ],
        ptrigger_words: [
            "<3", "love you", "love u", "luv u", "luv you", "you're cute", "your cute", "ur cute", "you're a cutie", "ur a cutie", "you cute", "u cute", "you're hot", "your hot", "ur hot",
            "you're sexy", "your sexy", "ur sexy", "you're nice", "you're lovely", "you're amazing", "you're smart", "you're great",
            "fuck off, pussy", "fuck off, asshole"
        ],
        complements: [
            "sexy nigga", "cute nigga", "babeh", "sugar tits", "babe"
        ],
        angry_responses: [
            "YOU BETTA WATCH CHO'SELF NIGGA OR I WAS GON' BUST A NUT IN YO EYEBALLS!", "SHUT CHO' MOUTH NIGGA!", "IMMA POP THROUGH DUH GODDAMN INTERNET AND POO ON YOU NIGGA!!!", "RESPECT MY SHIT DAWG OR I IS GON TICKLE YO ASS!!!",
            "DONT BE TALKIN SHIT YOU SCRAPPY-DOO LOOKING MUTHA FUCKA!!", "SHUT CHO FACE OR I IS GON' BUST IT UP!!", "YOU BETTA SHUT CHO MOUTH!!", "NIGGA, YOU NEED SOME TOILET PAPER? CUZ YOU IS A DIRTY ASSHOLE!", "YOU BETTA SETTLE DOWN NIGGA OR YOU IS GONNA BE PLAYIN DUCK DUCK GOOSE WITH MY DICK!"
        ],
        lovely_responses: [
            "AWWW! IMMA CUDDLE THE SHIT OUTCHU LITTLE NIGGA!", "AWW MAN IMMA THROW SOME CHEETO PUFFS ON THAT BOOTY AND SMACK THAT ASS!!!", "THANKS BOO BOO BEAR!", "THANKS DUUDEE!"
        ],
        nipples: [
            "http://i.imgur.com/Cj5oWaU.png", "http://goo.gl/kMWv", "http://goo.gl/Z1q8Vk"
        ],
        greetings: [
            "Ayoo!! Wassup homie?!", "How cho' nipples doin' today?", "How's it goin'?"
        ],
        words: [
            'kleiner', 'shrub', 'smodoopa', 'nipple', 'chobani', 'monkey', 'police', 'autumn',
            'grandmother', 'cookies', 'tobi', 'facebook', 'youtube', 'soundcloud', 'reddit', 'doritos', 'poop', 'keyboard', 'apple', 'banana', 'chicken', 'orange', 'skrillex', 'zomboy', 'penis', 'bench', 'president',
            'vagina', 'pubes', 'negrodamus', 'fetus', 'sword', 'febreeze', 'ninja', 'celery', 'jellyfish', 'steam', 'planes', 'squirrel', 'cheese', 'smoke', 'slope', 'calendar', 'columbia', 'spain', 'brazil', 'silver',
            'diamond', 'minecraft', 'mario', 'coach', 'pizza', 'hamburger', 'smoothie', 'lobster', 'burrito', 'cabbage', 'poison', 'ghost', 'cream', 'rabbits', 'brick', 'fruit', 'store', 'obama', 'stalin', 'hitler', 'beiber', 'kanye',
            'snake', 'underwear', 'spiders', 'cracker', 'skate', 'stomach', 'basketball', 'baseball', 'football', 'snail', 'government', 'grapes', 'curtain', 'pocket', 'doodie', 'flame', 'shadow', 'mountain', 'tomatoes',
            'creature', 'ducks', 'smegma', 'bomb', 'allah', 'trousers', 'weather', 'elbow', 'friction', 'scissors', 'bottle', 'alcohol', 'scarecrow', 'incest', 'redneck', 'birthday', 'copper', 'island', 'cherry',
            'potato', 'scarf', 'fedora', 'xbox', 'playstation', 'nintendo', 'microsoft', 'apple', 'mcdonalds', 'hooters', 'bubble', 'office', 'employee', 'school', 'college', 'pencil', 'notebook', 'mouth', 'chode', 'thunder', 'farts', 'spark', 'camera', 'computer',
            'processor', 'monitor', 'eggnog', 'lemonade', 'pepsi', 'summer', 'wilderness', 'thumb', 'picture', 'snapchat', 'facetime', 'quiver', 'ticket', 'kitty', 'nose', 'control', 'payment', 'crayon', 'ladybug', 'bettle', 'needle', 'amusement', 'toothpaste',
            'sneeze', 'tiger', 'pedophile', 'calculator', 'donkey', 'balloon', 'clown', 'insurance', 'slave', 'window', 'account', 'science', 'keyboard', 'volcano', 'michigan', 'washington', 'wrench', 'whistle', 'health', 'babies',
            'smash', 'advertisement', 'mailbox', 'hydrant', 'rainwater', 'controller', 'assault', 'pussy', 'clitoris', 'panda', 'rainbow', 'lightning', 'instructions', 'finger', 'mucus', 'butt', 'capitalism', 'cumstain', 'fartknocker', 'turdgargler', 'missluminescentBean',
            'vindsl', 'rico', 'qsick', 'colonoscopy', 'areolas', 'scrotum', 'testicular', 'buttmuncher', 'fartsniff', 'anal fissures', 'custard cannon', 'tallywhacker', 'buttlicker', 'shitstain', 'jewsknockeddownthetowers', 'granny trannies', 'food'
        ]
    }
};