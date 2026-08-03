use strict;
use warnings;
use IO::Socket::INET;

$| = 1;
$SIG{PIPE} = 'IGNORE';

my %types = (
  html => 'text/html; charset=utf-8',
  css  => 'text/css; charset=utf-8',
  js   => 'application/javascript; charset=utf-8',
  png  => 'image/png',
  jpg  => 'image/jpeg',
  jpeg => 'image/jpeg',
  ico  => 'image/x-icon',
);

my $port = 8081;
my $root = __FILE__;
$root =~ s{[^/\\]+$}{};

my $server = IO::Socket::INET->new(
  LocalPort => $port,
  Proto     => 'tcp',
  Listen    => 32,
  Reuse     => 1,
) or die "Cannot start server on $port: $!";

print "Serving $root on http://localhost:$port\n";

while (1) {
  my $client = $server->accept() or next;
  eval {
    $client->autoflush(1);
    local $SIG{ALRM} = sub { die "timeout\n" };
    alarm(5);
    my $request_line = <$client>;
    while (my $line = <$client>) {
      last if $line eq "\r\n" || $line eq "\n";
    }
    alarm(0);

    die "no request\n" unless $request_line;
    my ($method, $path) = $request_line =~ m{^(\w+)\s+(\S+)\s+HTTP};
    die "bad request\n" unless $path;
    $path = '/index.html' if $path eq '/';
    $path =~ s{^/}{};
    $path =~ s{\.\.}{}g;

    my $file = $root . $path;
    if (-e $file && -f $file) {
      open(my $fh, '<:raw', $file) or die "cannot open\n";
      local $/;
      my $content = <$fh>;
      close $fh;
      my ($ext) = $file =~ /\.([^.]+)$/;
      my $type = $types{lc($ext || '')} || 'application/octet-stream';
      print $client "HTTP/1.1 200 OK\r\nContent-Type: $type\r\nContent-Length: " . length($content) . "\r\nConnection: close\r\n\r\n";
      print $client $content;
    } else {
      my $body = "404 Not Found: $path";
      print $client "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\nContent-Length: " . length($body) . "\r\nConnection: close\r\n\r\n$body";
    }
  };
  eval { close $client } if $client;
}
