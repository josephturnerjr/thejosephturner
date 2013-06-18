from flask import (Flask, Blueprint, request, redirect, url_for,
                   render_template, session, abort)

import datetime
import markdown2
import os


POST_DIR = "posts"
app = Flask(__name__, static_folder='static')
app.config.from_object(__name__)
blog_views = Blueprint('blog_views', __name__)

def get_mod_date(fn):
    return datetime.datetime.fromtimestamp(os.stat(fn).st_mtime)


def load_post(post_slug):
    fn = os.path.join(app.config["POST_DIR"], os.path.basename(post_slug))
    print fn
    try:
        with open(fn) as f:
            post = f.read()
            post_date = get_mod_date(fn)
            return {"content": markdown2.markdown(post),
                    "date": post_date,
                    "title": post.split('\n')[0].strip("#"),
                    "slug": os.path.basename(post_slug)}
    except Exception, e:
        print e
        abort(404)


def load_posts(count, offset):
    posts = os.listdir(app.config["POST_DIR"])
    # Filter out dotfiles
    posts = filter(lambda x: not x.startswith('.'), posts)
    posts_fp = map(lambda x: os.path.join(app.config["POST_DIR"], x), posts)
    loaded_posts = sorted(posts_fp, key=get_mod_date, reverse=True)[offset:offset + count]
    return map(load_post, loaded_posts)


def get_nr_posts():
    posts = os.listdir(app.config["POST_DIR"])
    # Filter out dotfiles
    posts = filter(lambda x: not x.startswith('.'), posts)
    return len(posts)


@blog_views.route('/')
@blog_views.route('/page/<int:page_id>')
def index(page_id=0):
    POSTS_PER_PAGE = 4
    posts = load_posts(POSTS_PER_PAGE, page_id * POSTS_PER_PAGE)
    nr_posts = get_nr_posts()
    nr_pages = nr_posts / POSTS_PER_PAGE
    if nr_posts % POSTS_PER_PAGE > 0:
        nr_pages += 1
    return render_template('blog_index.html', posts=posts,
                           nr_pages=nr_pages, page_id=page_id)


@blog_views.route('/post/<post_slug>')
def post(post_slug):
    post = load_post(post_slug)
    return render_template('blog_post.html', post=post)
app.register_blueprint(blog_views, url_prefix='/blog')

if __name__ == "__main__":
    app.run(debug=True)
