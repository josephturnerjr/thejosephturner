FROM bretfisher/jekyll AS build

COPY Gemfile .

RUN bundle install --retry 5 --jobs 20

COPY . /site

RUN bundle exec jekyll build

FROM joseluisq/static-web-server:2

COPY --from=build /site/_site /public
