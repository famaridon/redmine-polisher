#! /bin/bash
rm -f redmine-polisher.xpi
zip -9 -r redmine-polisher.xpi * -x \*.sh \*.git\*
