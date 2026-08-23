from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'path', 'circle', 'svg'}
        self.line = 0

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_tags:
            self.tags.append((tag, self.getpos()[0]))

    def handle_endtag(self, tag):
        if tag not in self.void_tags:
            if not self.tags:
                pass
            else:
                last_tag, line = self.tags.pop()
                if last_tag != tag:
                    print(f'Mismatched at line {self.getpos()[0]}: expected </{last_tag}> (opened at {line}) but got </{tag}>')
                    self.tags.append((last_tag, line)) # put it back to not cascade errors completely

parser = MyHTMLParser()
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())