from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'path', 'circle', 'svg'}

    def handle_starttag(self, tag, attrs):
        if tag not in self.void_tags:
            self.tags.append(tag)

    def handle_endtag(self, tag):
        if tag not in self.void_tags:
            if not self.tags:
                print(f'Unmatched closing tag: {tag}')
            else:
                last_tag = self.tags.pop()
                if last_tag != tag:
                    print(f'Mismatched tag: expected </{last_tag}> but got </{tag}>')

parser = MyHTMLParser()
with open('Edit/Video/Add subtitles/index.html', 'r', encoding='utf-8') as f:
    parser.feed(f.read())
print('Unclosed tags remaining:', parser.tags)