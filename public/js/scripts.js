$(function() {

	window.fbAsyncInit = function() {
		FB.init({
			appId      : '271225436601989',
			xfbml      : true,
			version    : 'v2.6'
		});
	};

	(function(d, s, id){
		 var js, fjs = d.getElementsByTagName(s)[0];
		 if (d.getElementById(id)) {return;}
		 js = d.createElement(s); js.id = id;
		 js.src = "//connect.facebook.net/en_US/sdk.js";
		 fjs.parentNode.insertBefore(js, fjs);
	 }(document, 'script', 'facebook-jssdk'));

	$('#post-comment').hide();
    $('#btn-comment').on('click', function(event) {
        event.preventDefault();

        $('#post-comment').show();
    });

    $('#btn-like').on('click', function(event) {
        event.preventDefault();

        var imgId = $(this).data('id');

        $.post('/images/' + imgId + '/like').done(function(data) {
            $('.likes-count').text(data.likes);

						toastr.info("You liked this post", { timeout: 3000 });
        });
    });

    $('#btn-delete').on('click', function(event) {
        event.preventDefault();
        var $this = $(this);

        var remove = confirm('Are you sure you want to delete this image?');
        if (remove) {
            var imgId = $(this).data('id');
            $.ajax({
                url: '/images/' + imgId,
                type: 'DELETE'
            }).done(function(result) {
                if (result) {
                    $this.removeClass('btn-danger').addClass('btn-success');
                    $this.find('i').removeClass('fa-times').addClass('fa-check');
                    $this.append('<span> Deleted!</span>');

										toastr.error("Deleted!");
										window.location.href = "/";
                }
            });
        }
    });

		$('#shareBtn').on('click', function(e){
				e.preventDefault();

				FB.ui({
					method: 'share',
 					display: 'popup',
	 				href: 'https://piktr.herokuapp.com/',
 				}, function(response){});
		});

});
