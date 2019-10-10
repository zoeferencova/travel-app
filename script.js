'use strict';

const foursquareId = '5S4DIWE5USNCY0HOPLLXFZGYUI1QDCBZVSZ3EQECIZTPWCDA';
const foursquareKey = '45DSDFCFOGXPP51N4BXWFMB3LHCSMQYYZFBIO1UBT5LMNQTD';
const foursquareVersion = '20180323'
const foursquareSearchURL = 'https://api.foursquare.com/v2/venues/'

const newsKey = '5ea9e10fbd6545338beb1c8f81941f00'

function formatQuery(params) {
	const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
	return queryItems.join('&');
} 

//generate foursquare information
function searchFoursquare(query, near) {
	const endpoint = 'explore';
	const params = {
		client_id: foursquareId,
		client_secret: foursquareKey,
		v: foursquareVersion,
		near,
		query,
		limit: 1
	};
	const url = `${foursquareSearchURL}${endpoint}?${formatQuery(params)}`;
	fetch(url)
		.then(response =>  {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.statusText);
		})
		.then(responseJson => getAllDetails(responseJson))
		.catch(err => {
			console.log(err)
			$('main').addClass('hidden');
			$('.js-error-message').text(`Sorry, location "${near}" was not found.`).removeClass('hidden');
		});
}

function getAllDetails(response) {
	if (response.response.totalResults === 0) {
		console.log(response)
		$('.category-error-message').text(`Sorry, there were no results for "${response.response.query}" in ${response.response.geocode.where}.`).removeClass('hidden');
	}
	for (let i=0; i < response.response.groups[0].items.length; i++)  {
		const venueId = response.response.groups[0].items[i].venue.id;
		getLocationDetails(response, venueId);
	}
}

function getLocationDetails(response, venueId) {
	const params = {
		client_id: foursquareId,
		client_secret: foursquareKey,
		v: foursquareVersion,
	};
	const url = `${foursquareSearchURL}${venueId}?${formatQuery(params)}`;
	fetch(url)
		.then(response =>  {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.statusText);
		})
		.then(responseJson =>  {
			displayResults(responseJson);
			toggleInfoOnClick(responseJson);
		})
		.catch(err => {
			
		});		
}

function returnIfFound(item) {
	if (item === undefined || !item) {
		return '';
	} else {
		return item;
	}
}

function displayResults(response) {
	$('.js-search-results').append(
		`<button class="places-result-item">
			<img src=${getFoursquarePhoto(response)} alt="${response.response.venue.name}" class="places-image">
			<div class="places-text">
				<div class="places-name-and-rating">
					<h3 class="name">${response.response.venue.name}</h3>
					<span class="hidden address">${response.response.venue.location.address}</span>
					<div class="rating-container">
						<p class="places-rating">${returnIfFound(response.response.venue.rating)}</p>
					</div>
				</div>
				<div class="places-info">
					<p class="places-category">${response.response.venue.categories[0].name}</p>
					<p class="places-description">${returnIfFound(response.response.venue.description)}</p>
					<div class="additional-info hidden">
						${returnIfFound(response.response.venue.price) === response.response.venue.price ? `<p>Price Level: ${response.response.venue.price.message}</p>` : ''}
						<p>Contact Number: ${returnIfFound(response.response.venue.contact.phone)}</p>
						<p>${returnIfFound(response.response.venue.hours.status)}</p>
						<p>Hours:${formatHours(response)}</p>
						<a href="${returnIfFound(response.response.venue.url)}" class="website" target="_blank">Link to Website</a>
						<br><a href="#map-section" class="see-map">View on map</a>
					</div>
				</div>
			</div>
		</button>`
	);
	
}

function getFoursquarePhoto(response) {
	if (response.response.venue.bestPhoto === undefined || !response.response.venue.bestPhoto) {
		return 'images/sample-img.png';
	} else {
		const imagePrefix = response.response.venue.bestPhoto.prefix;
		const imageSuffix = response.response.venue.bestPhoto.suffix;
		const imageUrl =`${imagePrefix}100x100${imageSuffix}`;
		return imageUrl;
	};
}

function formatHours(response) {
	const arr = []
	for (let i=0; i < response.response.venue.hours.timeframes.length; i++) {
		const days = response.response.venue.hours.timeframes[i].days;
		console.log(days)
		const times = response.response.venue.hours.timeframes[i].open[0].renderedTime;
		arr.push(`${days}: ${times}`)
	}
	return arr.map(e => `<br>${e}`);
}

function toggleInfoOnClick(response) {
	$('.js-search-results').on('click', '.places-result-item', function(e) {
		e.preventDefault()
		const para = $(this).find('.additional-info')
		$('.places-result-item .additional-info').not($(this)).addClass('hidden')
		$(para).toggleClass('hidden')
	})
	$('.website').on('click', function(e) {
		e.stopImmediatePropagation();
	})
	$('.see-map').on('click', function(e) {
		e.stopImmediatePropagation();
	})
}

//generate wikipedia information
function searchWiki(query) {
	const params = {
	  origin: '*',
	  action: 'query',
	  format: 'json',
	  prop: 'extracts|pageimages',
	  indexpageids: 1,
	  redirects: 1, 
	  exchars: 1500,
	  exsectionformat: 'plain',
	  piprop: 'name|thumbnail|original',
	  pithumbsize: 250,
	  titles: query
	};

	const searchURL = 'https://en.wikipedia.org/w/api.php';
	const url = `${searchURL}?${formatQuery(params)}`;
	fetch(url)
		.then(response =>  {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.statusText);
		})
		.then(responseJson => displayWikiInfo(responseJson))
		.catch(err => {
			$('.wikipedia-excerpt').text(`No results were found for ${query}`);
		})
}

function displayWikiInfo(response) {
	const pageId = Number(response.query.pageids[0]);
	if (pageId === -1 || !pageId) {
		$('.wikipedia-excerpt').text(`Nothing was found for ${query.pages[-1].title}`);
	} else {
		const title = response.query.pages[pageId].title;
		const extract = response.query.pages[pageId].extract;
		const url = `https://en.wikipedia.org/wiki/${title}`;
		$('.wikipedia-excerpt').html(extract);
		$('.wikipedia-link').html(`More about ${title} <a href="${url}" target="_blank">here</a>`);
	};
	
}

//generate news information
function searchNews(city)  {
	const params = {
		apiKey: newsKey,
		q: `${city}`,
		pageSize: 4,
		language: 'en',
		sortBy: 'relevancy'
	};

	const searchURL = 'https://newsapi.org/v2/everything';
	const url = `${searchURL}?${formatQuery(params)}`;
	fetch(url)
		.then(response =>  {
			if (response.ok) {
				return response.json();
			}
			throw new Error(response.statusText)
		})
		.then(responseJson => displayNews(responseJson))
		.catch(err => {
			console.log(err)
			$('.js-error-message').text(`Something went wrong: ${err.message}`).removeClass('hidden');
		})
}

function displayNews(response) {
	if (!response.articles || response.articles.length === 0) {
		$('.news-results').append('No news was found.');
	}
	for (let i=0; i < response.articles.length; i++) {
		const title = response.articles[i].title;
		const author = response.articles[i].author;
		const source = response.articles[i].source.name;
		const description = response.articles[i].description;
		const image = response.articles[i].urlToImage;
		const published = response.articles[i].publishedAt;
		const url = response.articles[i].url;
		$('.news-results').append(
			`<li class="news-item">
				<img src="${image}" alt="${title}" class="news-image">
				<div class="news-content">
					<a href="${url}" target="_blank"><h3 class="name">${title}</h3></a>
					<div class="news-info">
						<p class="news-credit">by ${author} from ${source}</p>
						<p class="news-description">${description}</p>
						<p class="news-published">Published ${published}</p>
					</div>
				</div>
			</li>`
		);
	};
}

//create map
function createMap(query) {
	$('#map').empty();
	$('#map').append(`<iframe
	  width="100%"
	  height="100%"
	  frameborder="0" style="border:0"
	  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAneTY3_ApOO16hFLSvUESlvJAmiISfJ_c
	    &q=${encodeURIComponent(query)}" allowfullscreen>
	</iframe>`);
}

function updateMap() {
	$('.js-search-results').on('click', '.places-result-item', function(e) {
		e.preventDefault();
		const name = $(this).find('.name').text();
		const address = $(this).find('.address').text();
		$('#map').empty();
		$('#map').append(`<iframe
		  width="100%"
		  height="100%"
		  frameborder="0" style="border:0"
		  src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAneTY3_ApOO16hFLSvUESlvJAmiISfJ_c
		    &q=${encodeURIComponent(name)} ${encodeURIComponent(address)}" allowfullscreen>
		</iframe>`);
		$('.map-section span').text(name);

	});
}

function toTitleCase(phrase) {
  return phrase.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

function changeHeadings(city, category) {
	$('.place-word').text(city);
	$('.map-place-word').text(city);
	$('.category-word').text(category);
}

function recommendedCategories() {
	$('.box').on('click', function() {
		const category = $(this).text();
		$('#category-search').val(category);
	})
}

function scrollToSection(name) {
	if (name === 'map') {
		$(`.${name}-anchor`).on('click', function() {
			$("html, body").animate({ scrollTop: $(`#${name}-section`).offset().top });
	})
	} else {
		$(`.${name}-anchor`).on('click', function() {
		$("html, body").animate({ scrollTop: $(`#${name}-section`).offset().top - 120}, 500);
	})
	}
	
}

function changeLayout() {
	$('main').removeClass('hidden');
	$('.rec-categories').addClass('hidden');
	$('h1').addClass('hidden');
	$('.hero').addClass('top-bar');
	$('.submit-button').addClass('hidden');
	$('#small-submit-button').removeClass('hidden');
	$('.search-form').addClass('small-search-form');
	$('.search-bars').addClass('small-search-bars');
	$('.jump-to').removeClass('hidden')
	$('#city-search').val('').addClass('small-search');
	$('#category-search').val('').addClass('small-search');
}

function clearPrevious() {
	$('.js-search-results').empty();
	$('.news-results').empty();
	$('.wikipedia-info p').empty();
	$('.js-error-message').empty();
	$('.category-error-message').empty();
}

function watchForm() {
	$('form').submit(event => {
		clearPrevious();
		event.preventDefault();
		const city = toTitleCase($('#city-search').val());
		const category = $('#category-search').val();
		searchFoursquare(category, city);
		searchWiki(city);
		searchNews(city);
		createMap(city);
		changeHeadings(city, category);
		updateMap();
		changeLayout();
		scrollToSection('places')
		scrollToSection('map')
		scrollToSection('wikipedia')
		scrollToSection('news')
	});
}

$(watchForm())
$(recommendedCategories())
