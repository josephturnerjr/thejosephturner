from flask import (Flask,
                   render_template)
from blog_views import blog_views

app = Flask(__name__)
app.config.from_object(__name__)
app.register_blueprint(blog_views, url_prefix='/blog')


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/mandelbrot/')
def mb():
    return render_template('mandelbrot.html')


@app.route('/simpleline/')
def sl():
    return render_template('simpleline.html')


@app.route('/resume/')
def resume():
    return render_template('resume.html')


@app.route('/cheatingwithfriends/')
def cwf():
    return render_template('cheating.html')


if __name__ == "__main__":
    app.run(debug=True)
