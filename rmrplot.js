document.getElementById('calcBtn').addEventListener('click', function() {
    var m = parseFloat(document.getElementById('measured').value);
    var p = parseFloat(document.getElementById('predicted').value);
    if (isNaN(m) || isNaN(p) || p === 0) {
      alert('Please enter valid numbers for both Measured and Predicted RMR.');
      return;
    }
    var diff = ((m - p) / p) * 100;
    document.getElementById('percentDiff').textContent =
      'Difference: ' + diff.toFixed(1) + '%';
    
    var idx;
    if (diff <= -31)        idx = 0;
    else if (diff <= -16)   idx = 1;
    else if (diff <= 15)    idx = 2;
    else if (diff <= 30)    idx = 3;
    else                     idx = 4;

    for (var i = 0; i < 5; i++) {
      var seg = document.getElementById('seg' + i);
      if (i === idx) seg.classList.add('highlight');
      else           seg.classList.remove('highlight');
    }
  });