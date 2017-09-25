#! /bin/bash
rm -f redmine-polisher.xpi
zip -9 -r --exclude=*.sh --exclude=*.git* redmine-polisher.xpi *
