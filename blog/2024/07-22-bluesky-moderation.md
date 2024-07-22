# Experience and thoughts on community moderation on Bluesky

I've been running a community moderation pipeline for the Ukrainian community for over a year now. Watching some of the discourse around the topic on the English-speaking side was, ugh, painful. And, apparently, now is the time to gather things I said here and there into something more coherent.

<!--truncate-->

## Technical aspects

When we started out, labels weren't a thing yet. In-app reporting didn't let you select where to direct the report. Block lists weren't a thing either - you could only mute a list.

So we used the tools available as much as we could. Our primary output was (and still is) a bunch of mute lists, that people can pick and choose. Reporting was done by tagging a special account with a screenshot. Firehose listener would pick it up and create a new thread in a Discord forum channel.

Before an option to use mute list for blocking was implemented, I made a small AppEngine-hosted service to do just that - block and unblock accounts based on selected mute lists.

### The other side

Adding/removing entries to a mute list is a very small part of the job. A lot more code works on all the steps that lead to a decision on what to do about a given account.

I was lazy (and still am, BTW), so the very first approach to managing the lists, believe it or not, was to have a page in [Obsidian](https://obsidian.md) for each account, and keep it all in a git repo. That didn't work. The friction was too high, nobody but me wanted to even touch it.

One team member suggested "fuck it, let's just use JIRA" - which was the call in the right direction. But I had an idea about a slightly more lightweight system and we gave it a try: forum channels in Discord[^forum-channel].

[^forum-channel]: If you don't know what that is: you know how in a text chat in Discord or Slack you can reply to a message in a way that creates a new thread, instead of showing up in the main chat? Discord calls those, well, "threads", and I don't remember how they are named in Slack. Now take these threads, remove the main text chat, and fill the big hole in the UI with some representation of threads as separate posts. That's what a forum channel is. Discord allows you to sort them, search for a post, and even apply some custom tags.

And that worked surprisingly well. We already had a Discord server where we exchanged invite codes, so relevant people were already there. We'd keep a thread for each account - adding notes was as easy as posting a message, adding screenshots by simply pasting them in a thread. I've added a few functions to the bot: people could add a snapshot of someone's profile info with a single command.

Tags were used to both keep track of the progress, and for designating which lists an account should be added to. Managing them by hand was confusing though, so I added buttons and dropdowns to the first message in each thread - now you could take some action by simply pressing a button with a corresponding label on it. And it worked almost the same on mobile devices! Basically I was making a perfect trap for my ADHD brain: I'd start working on a ticket, if some manual action in that process was automatable - I would go update the code, get back to a ticket, close it, pick up the next one...

And that wasn't limited to just interactions with a single ticket. Later on I would also add prioritization: you press a button and the bot assigns you a random ticket, weighted by the number of recent posts (since doing something about inactive accounts is less important than about active ones).

All in all, I've built a makeshift ticket handling system out of sticks and stones. Thanks to using Discord as a UI, I could focus almost entirely on the business logic. Was it the best ticket handling system in the world? LOL, nope. Did it work well for us? Absolutely. Even better, thanks to Discord not allowing to embed any dynamic external content, it shaped the habit throughout all our workflows to make a self-contained snapshot of any content of interest: commands you give to the bot would create a message with nicely formatted embeds, representing a post or a profile, with a timestamp attached.

Unfortunately, all of it stopped working one day, when Discord disabled both the bot account and my main personal account, mentioning spam as a reason in the email. (Yes, the bot was posting stuff directly from firehose. It was heavily filtered down, so normally the traffic was quite low, but still.)

And then Discord's support took some weeks to even respond to my appeal. They did re-enable both accounts, but for almost a whole month all my fancy automation was dead.

But all the work done so far wasn't lost. I downloaded all the data we had and started looking for a self-hosted replacement. Once I've settled on a solution, it was time to migrate all the tickets: I would nuke the DB and re-run the migration quite a few times, until I got to a point of properly transferring all the notes, with timestamps, and properly attributed to each user.

What I'm trying to say here, the end result of your moderation pipeline (be it block lists, labels, or something else) is, from a technical standpoint, a tiny chunk of work. While you absolutely should account for what it is and its limits, try not to let it shape the rest of your pipeline. You've got humans interacting with it on a daily basis, tailor the system to work for them, instead of shoehorning them into a system that's not fit for purpose.

### Ozone and labels

With the news of Ozone source code being published and support for 3rd-party labelers... nothing really changed for us 🤷

Yes, a few of us brought up our own toy instances to play with. But it didn't really offer anything useful for us. Ozone, to the best of my somewhat outdated knowledge, still does not allow any kind of rich text input - so no adding screenshots to a ticket. Being focused on the use of ATproto API, it doesn't record historical changes (e.g., updating your profile is a valid way to weasel out of impersonation report - reviewer will be none the wiser that just a minute ago you were pretending to be the Secretary of State).

Labels also didn't bring much to the table. Our level of granularity is dealing with accounts, not individual posts. And account-level labels are pretty much useless aside from adding badges (block lists hide the account from you *and also prevent that account from interacting with you*, but for mostly benign categories like "Bots" it can be beneficial to not hide the content, but add a context).

### In-app reporting

What actually was useful is in-app reporting. Even if reporting categories aren't customizable and not always make sense for your use case, reduction in friction over anything else I could throw together was substantial.

These days I have a list of DIDs attached to each moderator, so when they report something - in the ticketing system it shows up as if they're adding a comment to the relevant ticket. And it's great for the users too: the process is much more straightforward, they don't need to make a public post at all, and on the receiving side I get the metadata of exactly what is being reported, instead of having to recover it from screenshots.

So immediately after receiving a report, we have a new ticket, with:
* all the metadata filled in (DID, handle, display name)
* the account's bio, avatar, and banner
* the post's text/timestamp/language tags (if target of a report is a post)
* with profile counters recorded
* raw JSON files for the report itself, and the post/profile record that was reported.

All of this happens in less than a second, with no human interaction other than the person sending the report, and does not disappear from our records no matter what changes are made on the network.

:::note

One bit of advice I have in this regard: don't return your internal ticket ID as a report ID to the user. At some point we may get the ability to query the status of reports from within the app, so you still want to be able to map the ID to a ticket in your system. But you don't have to disclose anything else. Most likely the internal IDs are sequentially increasing, so returning them leaks the rate of events that allocate a new ID (in case of Ozone, it seems to be any report or moderator action, so you can make a graph of their activity).

What I did in our case was to encrypt the ticket ID with [DES](https://en.wikipedia.org/wiki/Data_Encryption_Standard) (yes, it's broken for any serious application, but I think it's fine for obfuscating one number at a time).

:::

### What I'm looking for in a moderation system

I've got some requirements that might be nearly universal, but hey, you do you, I'm not gonna tell you how to do things. I'm not shy of writing a chunk of shitty code to do things for me, so it's okay if a feature is not present, but easy enough to add.

1. Some form of deduplication. Working at the level of granularity of whole accounts, it's important to keep notes in one place and not have them scattered around.
2. Rich text input: being able to add screenshots is the bare minimum.
3. Audit log. In case some shit goes down, you need to be able to at least get a clear sequence of events.
4. Some ability to automate things. Both adding new things on external events and initiating external actions from within. Off-the-shelf software is not going to do everything you need, so having ways to extend it is essential.

## Squishy meatbag aspects

The social side of moderation is a lot more complicated. I admit that I'm out of my depth here, and others have written about it with much more informed viewpoints than I can offer. But I will share with you some of my own observations and conclusions around what worked and what didn't for us.

### Differentiate intra-community and inter-community issues

Things happening within a community are rarely solved by moderatorial intrusion. Sure, you may put out a particular dumpster fire in a pinch, but the people who lit it are still there, still mad at each other, and now also mad at you. It's a fuckton of *drama* and stepping into it with extra big sledgehammers that other participants don't have is a bad idea. If you feel inclined - take off your moderator hat and jump in as a member of the community. But never try to be both at once.

Inter-community issues, where someone outside expresses unwanted attention to community members - that's where you should focus your efforts, and you'll have the support of your community.

### Remember who your users are

Know who you're providing service to. When someone complains about being added to a list they disagree with - keep in mind that their opinion plays no role in the decision process. A list exists for the benefit of people who subscribe to it, not the ones who get added to it.

### Actively discourage misuse of your lists/labels

To keep the previous point effective, you need to ensure your decisions are not used against others in an argument or for harassment. If someone weaponizes your lists or labels against others - you can be sure it'll get taken down soon enough.

### Someone will disagree with your decisions

Everyone in your community has slightly different opinions about many things. That's perfectly normal. Listen to them carefully, and evaluate if any change is warranted. Sometimes, when criteria are somewhat subjective, you will reverse a decision. Sometimes you'll have to explain why that decision was made. Sometimes you'll need to split a list/label in two with more narrow criteria.

### Take any criteria changes seriously

Users who benefit the most from your work are simultaneously the ones who notice it the least and the ones the least you hear from. Because what you're doing is removing from their space content they don't want to see, so they don't see it. And they don't reach out to you because it's all working great for them.

For that to continue it's important that criteria for a list or a label change as little as possible. If the criterion is simple and objective - spell it out directly and let automation keep up with it. If it's more subjective or harder to judge - at least maintain the goal and keep it from shifting into something else.

That does not mean you should never change anything though. Sometimes you'll have to do that. But it pays off to properly communicate the change well before it takes place.

### Try to recruit people who know when to recuse themselves

And cultivate as a norm to ask someone else to handle an issue when you feel too involved in it personally. Technical measures (like multi-party authorization) can only partially help here. And, let's be honest, your team is not big enough for most people to have no idea what most other people are doing, so extra friction from MPA will be a constant annoyance without much benefit.

### Avoid any kind of peer pressure to subscribe to this or that list

Tools you provide to the community should be useful to them. If someone subscribes not because they find it useful, but because everyone around is shaming them into it - well, you've got a lot of problems, but one of them is that you lose a measure of the value you provide to the community.

### Put people first and tools - second

In broad strokes you're dealing with two groups of people that you care about: your community and your moderators. And in both cases you should start with figuring out what they need and how you can achieve it, rather than taking a tool and trying to figure out what good it can do.

To your community you're probably going to give some mute/block lists and maybe some labels. Ensure that for each case you're trying to cover - you're using the right tool. Don't make an account-level label for direct aggression or harassment - make it a list instead. Don't replicate every list you have as a label - it'll just add to clutter and make it harder to see actually useful bits.

For your moderators you'll be making tools to make their job easier. Do not force them to understand every technical detail of your system. Take limitations of things you're working with as potential problems to overcome, instead of gospel for How Things Ought To Be.
