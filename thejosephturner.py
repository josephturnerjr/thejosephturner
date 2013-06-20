from flask import (Flask, Blueprint, request, redirect, url_for,
                   render_template, session, abort)
from blog_views import blog_views

app = Flask(__name__)
app.config.from_object(__name__)
app.register_blueprint(blog_views, url_prefix='/blog')


@app.route('/')
def home():
    return render_template('index.html')

if __name__ == "__main__":
    app.run(debug=True)

