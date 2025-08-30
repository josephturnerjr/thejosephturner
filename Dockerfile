FROM bretfisher/jekyll AS build

COPY . /site

RUN bundle install --retry 5 --jobs 20

RUN bundle exec jekyll build

FROM joseluisq/static-web-server:2

COPY --from=build /site/_site /public
