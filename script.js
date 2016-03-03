var baseUrl = 'http://localhost:3000';

var ractive = new Ractive({
  el: '#container',
  template: '#template',
  data: { candidates: [] },

  showVotes: function() {
    ractive.set('showingVotes', true);
  },

  showingVotes: false,
  totalVotes: function() {
    var voteCount = 0;
    var candidates = this.get('candidates');

    candidates.forEach(function(candidate) {
      voteCount += candidate.votes;
    });

    return voteCount;
  },

  calculatePercentage: function(candidateVote) {
    return Math.round( (candidateVote / ractive.totalVotes()) * 100 );
  },

  setPercentages: function() {
    var candidates = this.get('candidates');

    candidates.forEach(function(candidate) {
      var percentage = ractive.calculatePercentage(candidate.votes);
      var index = candidate.order;

      ractive.set('candidates.' + index + '.percentage', percentage);
    });
  },
});

ractive.on('vote', function(event) {
  var candidate = event.context.name;
  var index = event.context.order;

  ractive.showVotes();

  ractive.add('candidates.' + index + '.votes');
  
  // Save vote to db
  $.ajax({
    url: baseUrl + '/candidates/' + event.context.id,
    type: 'PATCH',
    dataType: 'JSON',
    success: function(data) {
      console.log('success');
    },
    error: function(error) {
      console.log('error');
    },
  });
  
  // PATCH  /candidates/:id(.:format) candidates#update

  ractive.setPercentages();
});

ractive.on('showVotes', function() {
  ractive.setPercentages();
  ractive.showVotes();
});

function getCandidates() {
  return $.getJSON(baseUrl + '/candidates').then(function(response) {
    response.forEach(function(candidate) {
      ractive.push('candidates', candidate);
    });
  });
}

window.onload = getCandidates();
