var lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas vestibulum euismod diam in blandit. Nam justo lectus, bibendum elementum eros at, euismod blandit nunc. Vivamus dapibus condimentum pulvinar. Curabitur nec orci ut mauris vestibulum gravida at eget lectus. In dignissim, leo quis malesuada ultrices, augue purus posuere odio, non rutrum risus nulla et urna. Pellentesque in mauris a est vulputate tempor vitae ut ex. Nunc in nunc vel sapien porttitor bibendum vel a magna. Duis quis nisl lacus. Praesent vitae lectus nec leo dapibus elementum. Phasellus leo metus, tincidunt quis risus ac, viverra viverra lacus. Maecenas consequat consectetur eleifend.';
var hackday_tour = (function ($, IN) {

	// Render the panel
	function panel(title, content, next, previous) {
		close();
		$('body').append('<div id="tour_panel"></div>');
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

	// First page of the tour
	function start_tour() {
		IN.User.authorize(function () {
			// GET profile info
			IN.API.Raw("/people/~").result(function (profile) {
				IN.API.Raw("/people/~/picture-url").result(function (picture) {
					panel('<img src="' + picture + '" align="abs-middle" height="35" /> Welcome to your tour ' + profile.firstName,
						[
						'<h2>This tour will help you discover content on ft.com.<br>',
						'<img src="http://localhost:8000/hackday-linkedin-intro.png" style="width:60%" /></h2>',
						'<h2>Judges are awesome!</h2>'
						].join(''), articles_by_industry);
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
			'<p class="subhead">', article.subhead, '</p>',
			'<p class="link"><a href="', article.link,'">Read more on ', article.title, '</a>',
			'</section>',
		].join('')
	}

	function articles_by_industry() {
		IN.API.Raw("/people/~/industry").result(function (industry) {
			panel(industry, [
				article({ title: 'Headline 1', subhead: lorem}, 'main'),
				article({ title: 'Headline 2', subhead: lorem}),
				article({ title: 'Headline 3', subhead: lorem}),
				].join(''), articles_by_position, start_tour);
		});
	}

	function articles_by_position() {
		IN.API.Raw("/people/~/positions").result(function (positions) {
			panel(positions.values[0].title, [
				].join(''), articles_by_location, articles_by_industry);
		});
	}

	function articles_by_location (argument) {
		IN.API.Raw("/people/~/location").result(function (location) {
			panel(location.name, [
				'<p>',location.country.code,'</p>'
				].join(''), registered, articles_by_position);
		});
	}

	function registered() {
		IN.API.Raw("/people/~/email-address").result(function (email) {
			panel('You&rsquo;re registered!', [
				'<h2>We&rsquo;ve used ', email, ' to register you.</h2>',
				'<p>You&rsquo;ve been sent an email with your details.</p>',
				'<p><a href="">Carry on reading articles</a></p>'
				].join(''), undefined, articles_by_location);
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
				panel('Loading...', 'Loading...');
				start_tour()
			});
	}

	$(document).ready(init);

	return {
		start_tour: start_tour,
		panel: panel,
		article: article
	};

}(FT.$, IN));