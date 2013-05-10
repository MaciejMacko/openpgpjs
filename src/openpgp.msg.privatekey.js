// GPG4Browsers - An OpenPGP implementation in javascript
// Copyright (C) 2011 Recurity Labs GmbH
// 
// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.
// 
// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.
// 
// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA

/**
 * @class
 * @classdesc Class that represents an OpenPGP key. Must contain a master key. 
 * Can contain additional subkeys, signatures,
 * user ids, user attributes.
 */

function openpgp_key() {
	this.packets = new openpgp_packetlist();

	/** Returns the master key (secret or public)
	 * @returns {openpgp_packet_secret_key|openpgp_packet_public_key|null} */
	this.getKey = function() {
		for(var i = 0; i < this.packets.length; i++)
			if(this.packets[i] instanceof openpgp_packet_secret_key ||
			this.packets[i] instanceof openpgp_packet_public_key)
				return this.packets[i];

		return null;
	}

	/** Returns all the private and public subkeys 
	 * @returns {openpgp_packet_subkey[]} */
	this.getSubkeys = function() {

		var subkeys = [];

		for(var i = 0; i < this.packets.length; i++)
			if(this.packets[i] instanceof openpgp_packet_secret_subkey ||
			this.packets[i] instanceof openpgp_packet_public_subkey)
			subkeys.push(this.packets[i]);

		return subkeys;
	}

	this.getAllKeys = function() {
		return [this.getKey()].concat(this.getSubkeys());
	}

	
	this.getSigningKey = function() {
		
		var signing = ['rsa_encrypt_sign', 'rsa_sign', 'dsa'];
		signing = signing.map(function(s) { return openpgp.publickey[s]; })

		var keys = this.getAllKeys();

		for(var i in keys)
			if(signing.indexOf(keys[i].public_algorithm) != -1)
				return keys[i];

		return null;
	}
	
	function getPreferredSignatureHashAlgorithm() {
		var pkey = this.getSigningKey();
		if (pkey == null) {
			util.print_error("private key is for encryption only! Cannot create a signature.")
			return null;
		}
		if (pkey.publicKey.publicKeyAlgorithm == 17) {
			var dsa = new DSA();
			return dsa.select_hash_algorithm(pkey.publicKey.MPIs[1].toBigInteger()); // q
		}
		//TODO implement: https://tools.ietf.org/html/rfc4880#section-5.2.3.8
		//separate private key preference from digest preferences
		return openpgp.config.config.prefer_hash_algorithm;
			
	}

	this.decrypt = function(passphrase) {
		var keys = this.getAllKeys();

		for(var i in keys)
			if(keys[i] instanceof openpgp_packet_secret_subkey ||
			keys[i] instanceof openpgp_packet_secret_key)
			
			keys[i].decrypt(passphrase);
	}
	

	// TODO need to implement this
	function revoke() {
		
	}

	
}
