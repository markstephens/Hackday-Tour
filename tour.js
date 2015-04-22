var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vestibulum euismod diam in blandit. Nam justo lectus, bibendum elementum eros at, euismod blandit nunc. Vivamus dapibus condimentum pulvinar. Curabitur nec orci ut mauris vestibulum gravida at eget lectus. In dignissim, leo quis malesuada ultrices, augue purus posuere odio, non rutrum risus nulla et urna. Pellentesque in mauris a est vulputate tempor vitae ut ex. Nunc in nunc vel sapien porttitor bibendum vel a magna. Duis quis nisl lacus. Praesent vitae lectus nec leo dapibus elementum. Phasellus leo metus, tincidunt quis risus ac, viverra viverra lacus. Maecenas consequat consectetur eleifend.';
var hackday_tour = (function ($, IN) {

	// Render the panel
	function panel(title, content, next, previous, add_class) {
		close();

		var classes = [];

		if (typeof add_class !== "undefined") {
			classes.push(add_class);
		}

		$('body').append('<div id="tour_panel" class="' + classes.join(' ') + '"></div>');
		$('#tour_panel').append('<a href="javascript:// Close" class="close_panel">x</a>');
		$('#tour_panel').append('<h1 class="title">' + title + '</h1>');
		$('#tour_panel').append('<div class="content">' + content + '</div>');
		$('#tour_panel').append('<div id="tour_next_previous"></div>');

		$('#tour_panel .close_panel').on('click', close);

		if (typeof next !== "undefined") {
			$('#tour_next_previous').append('<a href="javascript:// Next" class="button next">Next &raquo;</a>');
			$('#tour_next_previous .next').on('click', next);
		}

		if (typeof previous !== "undefined") {
			$('#tour_next_previous').append('<a href="javascript:// Previous" class="button previous">&laquo; Previous</a>');
			$('#tour_next_previous .previous').on('click', previous);
		}
	}

	function close() {
		$('#tour_panel').remove();
	}

	// Intro screen
	function intro() {
		panel('This tour will help you discover content on ft.com.',
		[
		'<div><img src="http://localhost:8000/hackday-linkedin-intro.png" style="width:70%;margin-left:10%;" /></div>',
		'<h2 style="text-align:center; color:#444">(Judges are awesome!)</h2>'
		].join(''), start_tour);
	}

	// First page of the tour
	function start_tour() {
		IN.User.authorize(function () {
			// GET profile info
			IN.API.Raw("/people/~").result(function (profile) {
				IN.API.Raw("/people/~/picture-urls::(original)").result(function (pictures) {
					panel('Welcome to your tour ' + profile.firstName + '.',
						[
						'<div class="splash">',
						'<h2><img src="' + pictures.values[0] + '" align="absmiddle" width="160" />  You&rsquo;re all set.</h2>',
						'<h1>Start with what&rsquo;s popular in your industry</h1>',
						'</div>'
						].join(''), articles_by_industry, undefined, 'industry');

					$('#start_button').on('click', articles_by_industry);
				});
			});
		});
	}

	// Render an article in HTML
	function article(article, addclass) {
		var classes = ['article'];

		if (typeof addclass !== "undefined") {
			classes.push(addclass);
		}

		return [
			'<section class="', classes.join(' '),'">',
			'<h1 class="headline">', article.title, '</h1>',
			'<img src="', article.imageUrl, '" align="right" width="', (classes.indexOf('main') !== -1 ? 400 : 200) ,'" />',
			'<p class="subhead">', article.previewText, '</p>',
			'<p class="link"><a href="http://www.ft.com/s/', article.id,'" target="_blank">', article.title, ' &raquo;</a>',
			'</section>',
		].join('')
	}

	function articles_by_industry() {
		IN.API.Raw("/people/~/industry").result(function (industry) {
			$.get('http://52.17.174.96:8080/articles?industry=' + encodeURIComponent(decodeURIComponent(industry)), function (articles) {
				panel('Popular in the ' + industry + ' industry.', [
					article(articles[0], 'main'),
					article(articles[1]),
					article(articles[2]),
					article(articles[3], 'main'),
					article(articles[4]),
					article(articles[5]),
					].join(''), articles_by_position, start_tour);	
			});
		});
	}

	function articles_by_position() {
		IN.API.Raw("/people/~/positions").result(function (positions) {
			$.get('http://52.17.174.96:8080/articles?position=' + encodeURIComponent(decodeURIComponent(positions.values[0].title)), function (articles) {
				panel('Popular with ' + positions.values[0].title + ' professionals.', [
					article(articles[0], 'main'),
					article(articles[1]),
					article(articles[2]),
					article(articles[3], 'main'),
					article(articles[4]),
					article(articles[5]),
					].join(''), articles_by_location, articles_by_industry);
			});
		});
	}

	function articles_by_location (argument) {
		IN.API.Raw("/people/~/location").result(function (location) {
			$.get('http://52.17.174.96:8080/articles?country_code=' + encodeURIComponent(decodeURIComponent(location.country.code.toUpperCase())), function (articles) {
				panel('Popular near you, in ' + location.name + '.', [
					article(articles[0], 'main'),
					article(articles[1]),
					article(articles[2]),
					article(articles[3], 'main'),
					article(articles[4]),
					article(articles[5]),
					].join(''), registered, articles_by_position);
			});
		});
	}

	function registered() {
		IN.API.Raw("/people/~/email-address").result(function (email) {
			panel('You&rsquo;re registered!', [
				'<div class="splash">',
				'<h2>We&rsquo;ve used ', email, ' to register you.<br />&nbsp;<br />',				
				'<img src="http://localhost:8000/Email-Icon-1024x768.jpg" width="100" align="absmiddle" /> You&rsquo;ve been sent an email with your details.</h2>',
				'<h2 style="font-size:3em"><a href="http://www.ft.com">Carry on reading articles with your account &raquo;</a></h2>',
				'</div>'
				].join(''), undefined, articles_by_location, 'industry');
		});
	}

	function init() {
		// TODO Check if user is anonymous

		$('body').append('<div id="start_tour"></div>');
		$('#start_tour')
			.html(['Use ',
				'<img src="https://www.linkedin.com/scds/common/u/images/logos/linkedin/logo_linkedin_242x59_v1.png" alt="LinkedIn" height="18" /> ',
				'to<br />',
				'see what people similar<br/>',
				'to you are reading on<br />',
				'<img src="http://im.ft-static.com/m/img/masthead_main.jpg" height="13" style="margin-top: 5px" />',
				' <span style="font-size:1.5em; margin-left:0.4em">&raquo;</span>'
				].join(''))
			.on('click', function () {
				$(this).hide();
				intro()
			});
	}

	$(document).ready(init);

	return {
		start_tour: start_tour,
		panel: panel,
		article: article
	};

}(FT.$, IN));